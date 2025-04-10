import { AddIcon } from "@sanity/icons";
import { Button } from "@sanity/ui";

export function NewTreeItem({ addItem, text = 'Add menu item' }: { addItem: () => void, text?: string }) {
    return (
        <Button
            mode="bleed"
            icon={AddIcon}
            justify='flex-start'
            text={text}
            textAlign='left'
            className='w-full text-left'
            onClick={addItem}
            tone="suggest"
            width="fill"
            padding={2}
        />
    )
}