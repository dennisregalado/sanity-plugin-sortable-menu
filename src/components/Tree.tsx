import { useRef, useState } from 'react';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { isKeyboardEvent } from '@dnd-kit/dom/utilities';
import { move } from '@dnd-kit/helpers';
import { FlattenedItem, type Item } from '../types.js';
import {
    flattenTree,
    buildTree,
    getProjection,
    getDragDepth,
} from '../utils.js';
import { TreeItem } from './TreeItem.js';
import { TreeItemOverlay } from './TreeItemOverlay';
import { Grid, Card } from '@sanity/ui';
import { NewTreeItem } from './NewTreeItem.jsx';
import { randomKey } from '@sanity/util/content';
import { ArrayOfObjectsItem } from 'sanity';
import {useDocumentPane} from 'sanity/structure'

interface Props {
    items: Item[];
    indentation?: number;
    maxDepth?: number;
    onChange(items: Item[]): void;
    members: Array<{key: string; field?: any}>;
    context: any;
}

export function Tree({ items, members, context, indentation = 50, maxDepth = 5, onChange }: Props) {
    const [flattenedItems, setFlattenedItems] = useState<FlattenedItem[]>(() =>
        flattenTree(items)
    );
    
    const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const initialDepth = useRef(0);
    const sourceChildren = useRef<FlattenedItem[]>([]);

    const isLastChild = (item: FlattenedItem) => {
        const siblings = flattenedItems.filter(i => i.parentId === item.parentId);
        return siblings[siblings.length - 1]?.id === item.id;
    };

    const getParentItem = (parentId: string | null) => {
        return parentId ? flattenedItems.find(item => item.id === parentId) : null;
    };

    // Filter out children of collapsed items, but keep dragged item and its new siblings visible
    const visibleItems = flattenedItems.filter(item => {
        // Always show root items
        if (!item.parentId) return true;
        
        // During drag operations, always show the dragged item
        if (draggedItemId === item.id) return true;

        // If this item is a sibling of the dragged item (same parent), show it
        if (draggedItemId) {
            const draggedItem = flattenedItems.find(i => i.id === draggedItemId);
            if (draggedItem && item.parentId === draggedItem.parentId) return true;
        }
        
        // Check if any parent in the chain is collapsed
        let currentParentId: string | null = item.parentId;
        while (currentParentId) {
            if (collapsedItems.has(currentParentId)) {
                // If this is the dragged item's new parent, show it
                const draggedItem = draggedItemId ? flattenedItems.find(i => i.id === draggedItemId) : null;
                if (draggedItem && currentParentId === draggedItem.parentId) {
                    return true;
                }
                return false;
            }
            const parent = flattenedItems.find(i => i.id === currentParentId);
            if (!parent) break;
            currentParentId = parent.parentId || null;
        }
        return true;
    });

    const handleCollapse = (itemId: string, isCollapsed: boolean) => {
        setCollapsedItems(prev => {
            const next = new Set(prev);
            if (isCollapsed) {
                next.add(itemId);
            } else {
                next.delete(itemId);
            }
            return next;
        });
    };

    const handleAddItem = ({
        parentId,
        depth,
    }: {
        parentId: string | null,
        depth: number
    }) => {

        const newItem: FlattenedItem = {
            _key: randomKey(12),
            _type: 'menuItem',
            label: '',
            url: '',
            children: [],

            id: randomKey(12),
            isEditing: true,
            parentId,
            depth,
            index: flattenedItems.length,
        };

        const tree = buildTree([...flattenedItems, newItem]);
        setFlattenedItems(flattenTree(tree));
        onChange(tree);
    }

    return (
        <DragDropProvider
            onDragStart={(event) => {
                const { source } = event.operation;
                if (!source) return;

                const { depth } = flattenedItems.find(({ id }) => id === source.id)!;
                setDraggedItemId(source.id as string);

                setFlattenedItems((flattenedItems) => {
                    sourceChildren.current = [];
                    return flattenedItems.filter((item) => {
                        if (item.parentId === source.id) {
                            sourceChildren.current = [...sourceChildren.current, item];
                            return false;
                        }
                        return true;
                    });
                });

                initialDepth.current = depth;
            }}
            onDragOver={(event, manager) => {
                const { source, target } = event.operation;

                event.preventDefault();

                if (source && target && source.id !== target.id) {
                    setFlattenedItems((flattenedItems) => {
                        const offsetLeft = manager.dragOperation.transform.x;
                        const dragDepth = getDragDepth(offsetLeft, indentation);
                        const projectedDepth = initialDepth.current + dragDepth;


                        // Prevent dragging items beyond the maximum allowed depth
                        // If the projected depth would exceed maxDepth, return the current state unchanged
                        if (projectedDepth > maxDepth) {
                            return flattenedItems;
                        }

                        const { depth, parentId } = getProjection(
                            flattenedItems,
                            target.id,
                            projectedDepth
                        );

                        const sortedItems = move(flattenedItems, event);
                        const newItems = sortedItems.map((item) =>
                            item.id === source.id ? { ...item, depth, parentId } : item
                        );

                        return newItems;
                    });
                }
            }}
            onDragMove={(event, manager) => {
                if (event.defaultPrevented) {
                    return;
                }

                const { source, target } = event.operation;

                if (source && target) {
                    const keyboard = isKeyboardEvent(event.operation.activatorEvent);
                    const currentDepth = source.data!.depth ?? 0;
                    let keyboardDepth;

                    if (keyboard) {
                        const isHorizontal = event.by?.x !== 0 && event.by?.y === 0;

                        if (isHorizontal) {
                            event.preventDefault();

                            keyboardDepth = currentDepth + Math.sign(event.by!.x);

                            // Prevent keyboard navigation beyond maxDepth
                            // If the keyboard navigation would take the item beyond maxDepth, cancel the operation
                            if (keyboardDepth > maxDepth) {
                                return;
                            }
                        }
                    }

                    const offsetLeft = manager.dragOperation.transform.x;
                    const dragDepth = getDragDepth(offsetLeft, indentation);

                    const projectedDepth =
                        keyboardDepth ?? initialDepth.current + dragDepth;


                    // Prevent dragging beyond maxDepth
                    // If the projected depth would exceed maxDepth, cancel the drag operation
                    if (projectedDepth > maxDepth) {
                        return;
                    }

                    const { depth, parentId } = getProjection(
                        flattenedItems,
                        source.id,
                        projectedDepth
                    );

                    if (keyboard) {
                        if (currentDepth !== depth) {
                            const offset = indentation * (depth - currentDepth);

                            manager.actions.move({
                                by: { x: offset, y: 0 },
                                propagate: false,
                            });
                        }
                    }

                    if (
                        source.data!.depth !== depth ||
                        source.data!.parentId !== parentId
                    ) {
                        setFlattenedItems((flattenedItems) => {
                            return flattenedItems.map((item) =>
                                item.id === source.id ? { ...item, depth, parentId } : item
                            );
                        });
                    }
                }
            }}
            onDragEnd={(event) => {
                setDraggedItemId(null);
                
                if (event.canceled) {
                    return setFlattenedItems(flattenTree(items));
                }

                const updatedTree = buildTree([
                    ...flattenedItems,
                    ...sourceChildren.current,
                ]);

                setFlattenedItems(flattenTree(updatedTree));
                onChange(updatedTree);
            }}
        >
            <Card border={true} padding={1} radius={2}>
                <Grid gap={1} as="ul">
                    {visibleItems.map((item, index) => {
                        const parent = getParentItem(item.parentId);
                        const hasAddButton = parent && isLastChild(item) && item.depth <= maxDepth;
                        const matchMember = members.find((member) => member.key === item._key);

                        return (
                            <>
                                <TreeItem
                                    editing={matchMember && (
                                        <ArrayOfObjectsItem
                                            {...matchMember.parentProps} 
                                            key={matchMember.key}
                                            index={index}
                                            member={matchMember}
                                        />
                                    )}
                                    key={item.id}
                                    {...item}
                                    index={index}
                                    collapsed={collapsedItems.has(item.id)}
                                    onCollapse={(isCollapsed: boolean) => handleCollapse(item.id, isCollapsed)}
                                    onRemove={() => {
                                        const newItems = flattenedItems.filter(({ id }) => id !== item.id);
                                        const tree = buildTree(newItems);
                                        setFlattenedItems(flattenTree(tree));
                                        onChange(tree);
                                    }}
                                >
                                </TreeItem>
                                {hasAddButton && (
                                    <li key={item.id + 'add-button'} style={{ marginLeft: (item.depth) * indentation }}>
                                        <NewTreeItem
                                            text={parent!.label ? `Add menu item to ${parent!.label}` : 'Add menu item'}
                                            addItem={() => handleAddItem({ parentId: parent!.id, depth: item.depth })}
                                        />
                                    </li>
                                )}
                            </>
                        )
                    })}
                    <NewTreeItem addItem={() => handleAddItem({ parentId: null, depth: 0 })} />
                </Grid>
            </Card>
            <DragOverlay style={{ width: 'min-content' }}>
                {(source) => (
                    <TreeItemOverlay {...source} children={sourceChildren.current} />
                )}
            </DragOverlay>
        </DragDropProvider>
    );
}