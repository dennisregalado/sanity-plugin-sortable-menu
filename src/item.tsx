import React, { useMemo, useState } from 'react';
import { TreeItemProvider } from './hooks/useTreeItem';
import { ObjectItemProps } from 'sanity';
import { CheckmarkIcon, ChevronDownIcon, ChevronRightIcon, DragHandleIcon, EditIcon, TrashIcon } from '@sanity/icons';
import { Button, Card, Flex, Text, Tooltip } from '@sanity/ui';
import { useSortable } from '@dnd-kit/react/sortable';
import { useTree } from './hooks/useTree';

export function Item(props: ObjectItemProps) {
    const { value, onRemove } = props;

    const { flattenedItems } = useTree();

    const flattenedItem = useMemo(() => {
        return (flattenedItems || [])?.find((item) => item._key === value._key)
    }, [flattenedItems, value])

    const hasChildren = useMemo(() => {
        return value.children?.length > 0
    }, [value])

    const inlineEditingProps = {
        ...props.inputProps,
        members: props.inputProps.members.filter((member) => member.kind == 'field' && member.name !== 'children')
    }

    const childrenProps = {
        ...props.inputProps,
        members: props.inputProps.members.filter((member) => member.kind == 'field' && member.name == 'children')
    }

    const [isEditing, setIsEditing] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    console.log('flattenedItem from Item', {
        id: flattenedItem?._key,
        index: flattenedItem?.index,
        depth: flattenedItem?.depth,
        parentId: flattenedItem?.parentId,
    })


    const { ref, handleRef, isDragSource, isDragging } = useSortable({
        alignment: {
            x: 'start',
            y: 'center',
        },
        transition: {
            idle: true,
        },
        id: flattenedItem?._key,
        index: flattenedItem?.index,
        data: {
            depth: flattenedItem?.depth,
            parentId: flattenedItem?.parentId,
        },
    });


    return <>
        <div ref={ref} aria-hidden={isDragSource} style={{
            ...(isDragging && {
                zIndex: 5,
                position: 'relative',
            }),
        }}>
            <TreeItemProvider value={{ isEditing, setIsEditing, isHovering, setIsHovering }}>
                <Card
                    padding={1}
                    radius={2}
                    shadow={(!isHovering && isDragging) ? 5 : 0}
                    tone={isHovering && !isDragging && !isEditing ? 'transparent' : 'inherit'}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <Flex gap={1} width="fill" align={isEditing ? 'flex-end' : 'center'} paddingBottom={isEditing ? 3 : 0}>
                        <Tooltip
                            content={
                                <Text size={1}>
                                    Drag to re-order
                                </Text>
                            }
                            animate
                            fallbackPlacements={['right', 'left']}
                            placement="bottom"
                            portal
                        >
                            <Button ref={handleRef} paddingX={2} mode="bleed" icon={DragHandleIcon} style={{ cursor: 'all-scroll' }} />
                        </Tooltip>
                        {hasChildren && (
                            <Tooltip
                                content={
                                    <Text size={1}>
                                        {collapsed ? 'Expand' : 'Collapse'}
                                    </Text>
                                }
                                animate
                                fallbackPlacements={['right', 'left']}
                                placement="bottom"
                                portal
                            >
                                <Button mode="bleed" paddingX={2} icon={collapsed ? ChevronRightIcon : ChevronDownIcon} onClick={() => setCollapsed(!collapsed)} />
                            </Tooltip>
                        )}
                        <style>
                            {`
          #menu-item > div {
            width: 100%;
          }
        `}
                        </style>
                        <Flex width="fill" style={{ width: '100%' }} id='menu-item'>
                            {isEditing ? (
                                <>
                                    {inlineEditingProps.renderInput(inlineEditingProps)}
                                </>
                            ) : <>
                                {props.inputProps.renderPreview(props.inputProps)}
                            </>
                            }
                        </Flex>
                        {(isHovering || isEditing) && (
                            <Flex gap={1} style={{ flexShrink: 0 }}>
                                {isEditing ?
                                    <Tooltip
                                        content={
                                            <Text size={1}>
                                                Preview
                                            </Text>
                                        }
                                        animate
                                        fallbackPlacements={['right', 'left']}
                                        placement="bottom"
                                        portal
                                    >
                                        <Button paddingX={2} mode="bleed" icon={CheckmarkIcon} onClick={() => setIsEditing(false)} />
                                    </Tooltip> :
                                    <Tooltip
                                        content={
                                            <Text size={1}>
                                                Edit
                                            </Text>
                                        }
                                        animate
                                        fallbackPlacements={['right', 'left']}
                                        placement="bottom"
                                        portal
                                    >
                                        <Button paddingX={2} mode="bleed" icon={EditIcon} onClick={() => setIsEditing(true)} />
                                    </Tooltip>
                                }
                                <Tooltip
                                    content={
                                        <Text size={1}>
                                            Remove
                                        </Text>
                                    }
                                    animate
                                    fallbackPlacements={['right', 'left']}
                                    placement="bottom"
                                    portal
                                >
                                    <Button mode="bleed" onClick={onRemove} paddingX={2} icon={TrashIcon} tone="critical" />
                                </Tooltip>
                            </Flex>
                        )}
                    </Flex>
                </Card>
            </TreeItemProvider>
        </div>
        {!collapsed && <>
            {childrenProps.renderInput(childrenProps)}
        </>}
    </>
}