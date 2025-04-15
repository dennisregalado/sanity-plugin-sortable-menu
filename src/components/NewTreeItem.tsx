import { AddIcon, EllipsisVerticalIcon } from "@sanity/icons";
import { Box, Button, MenuItem, Menu, MenuDivider, MenuButton, Text, Grid, Flex } from "@sanity/ui";
import { useMemo, useState } from "react";
import { ArraySchemaType } from "sanity";

export function NewTreeItem({ addItem, text = 'Add menu item', schemaType }: { addItem: (type: string) => void, text?: string, schemaType?: ArraySchemaType }) {

    if (!schemaType) {
        return null;
    }


    const hasMultipleTypes = useMemo(() => {
        return schemaType?.of?.length > 1;
    }, [schemaType]);

    const [isOpen, setIsOpen] = useState(false);

    if (hasMultipleTypes) {

        return (
            <Flex gap={1} align="flex-start">
                <Button
                    mode="bleed"
                    justify='flex-start'
                    textAlign='left'
                    tone="suggest" 
                    width={!isOpen ? 'fill' : undefined}
                    padding={2}
                    icon={AddIcon}
                    text="Add items"
                    onClick={() => setIsOpen(!isOpen)}
                />
                {isOpen && (
                    <Grid gap={1}>
                    {schemaType.of.map((item) => (
                        <Button
                            mode="bleed"
                            justify='flex-start'
                            text={item.title}
                            textAlign='left'
                            onClick={() => addItem(item.name)}
                            tone="suggest" 
                            padding={2}
                        />
                    ))}
                </Grid>
                )}
            </Flex>
        )
    }

    return <Button
        mode="bleed"
        icon={AddIcon}
        justify='flex-start'
        text={text}
        textAlign='left'
        className='w-full text-left'
        onClick={() => addItem(schemaType.of[0].name)}
        tone="suggest"
        width="fill"
        padding={2}
    />
}