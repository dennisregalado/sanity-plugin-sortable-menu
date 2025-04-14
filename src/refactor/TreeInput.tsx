import { ArrayOfObjectsInputProps, ArrayOfObjectsItem, MemberItemError } from "sanity";
import { NewTreeItem } from '../components/NewTreeItem'
import { randomKey } from '@sanity/util/content'
import { useCallback, useMemo, useRef, useState } from "react";
import { useFormValue, set } from 'sanity'
import { Card, Grid } from "@sanity/ui";
import { TreeItemOverlay } from "../components/TreeItemOverlay";
import { DragOverlay, DragDropProvider } from "@dnd-kit/react";
import { FlattenedItem, Item } from "../types";
import { buildTree, flattenTree, getDragDepth, getProjection } from "../utils";
import { isKeyboardEvent } from '@dnd-kit/dom/utilities';
import { move } from '@dnd-kit/helpers';
import { TreeProvider } from "../hooks/useTree";

const INDENTATION = 50;

export function TreeInput(props: ArrayOfObjectsInputProps) {

    const { onChange, path, onItemAppend } = props;

    const isRoot = useMemo(() => path.length === 1, [path])
    const hasChildren = useMemo(() => props.value && props.value.length > 0, [props.value])
    const parentPath = useMemo(() => path.slice(0, -1), [path])
    const parentValue = useFormValue(parentPath)

    const onAddItem = useCallback(
        async () => {
            const item = {
                _key: randomKey(12),
                _type: 'menuItem',
            };

            onItemAppend(item)
        },
        [onChange],
    );

    return isRoot ? <RootTree indentation={INDENTATION} onChange={(items) => {
        onChange(set(items));
    }}
        items={props.value || []}>
        {props.members.map((member) => {
            if (member.kind === 'item') {
                return (
                    <ArrayOfObjectsItem
                        {...props}
                        key={member.key}
                        member={member}
                    />
                )
            }

            return <MemberItemError key={member.key} member={member} />
        })}
        <NewTreeItem addItem={onAddItem} />
    </RootTree> : <>
        {props.members.map((member) => {
            if (member.kind === 'item') {
                return (
                    <ArrayOfObjectsItem
                        {...props}
                        key={member.key}
                        member={member}
                    />
                )
            }

            return <MemberItemError key={member.key} member={member} />
        })}
        {hasChildren && <NewTreeItem text={parentValue?.label && `Add menu item to ${parentValue.label}` || 'Add menu item'} addItem={onAddItem} />}
    </>
}

function RootTree({
    indentation = 50,
    onChange,
    children,
    items = []
}: {
    onChange: (items: Item[]) => void
    items: Item[]
    children: React.ReactNode
    indentation?: number
}) {

    const [flattenedItems, setFlattenedItems] = useState<FlattenedItem[]>(() =>
        flattenTree(items)
    );
    const initialDepth = useRef(0);
    const sourceChildren = useRef<FlattenedItem[]>([]);

    return <>
        <DragDropProvider onDragStart={(event) => {
            const { source } = event.operation;

            if (!source) return;

            const { depth } = flattenedItems.find(({ id }) => id === source.id)!;

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
                        }
                    }

                    const offsetLeft = manager.dragOperation.transform.x;
                    const dragDepth = getDragDepth(offsetLeft, indentation);

                    const projectedDepth =
                        keyboardDepth ?? initialDepth.current + dragDepth;

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
                if (event.canceled) {
                    return setFlattenedItems(flattenTree(items));
                }

                const updatedTree = buildTree([
                    ...flattenedItems,
                    ...sourceChildren.current,
                ]);

                setFlattenedItems(flattenTree(updatedTree));

                onChange(updatedTree);
            }}>

            <Card border={true} padding={1} radius={2}>
                <Grid gap={1} as="ul">
                    <TreeProvider value={{ flattenedItems, setFlattenedItems }}>
                        {children}
                    </TreeProvider>
                </Grid>
            </Card>
            <DragOverlay style={{ width: 'min-content' }}>
                {(source) => (
                    <TreeItemOverlay {...source} children={sourceChildren.current} />
                )}
            </DragOverlay>
        </DragDropProvider>
    </>
}