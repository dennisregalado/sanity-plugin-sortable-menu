// @ts-nocheck
import { ArrayOfObjectsInputProps, ArrayOfObjectsInputProps, ArrayOfObjectsItem, SchemaType, Image } from 'sanity'
import { NewTreeItem } from './NewSortableItem'
import { randomKey } from '@sanity/util/content'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useFormValue, set, PatchEvent, insert } from 'sanity'
import { Card, Grid } from '@sanity/ui'
import { SortableItemOverlay } from './SortableItemOverlay'
import { DragOverlay, DragDropProvider } from '@dnd-kit/react'
import { FlattenedItem } from './types'
import { buildTree, flattenTree, getDragDepth, getProjection } from './utils'
import { isKeyboardEvent } from '@dnd-kit/dom/utilities'
import { move } from '@dnd-kit/helpers'
import { TreeProvider, useTree } from './hooks/useTree'
import { MenuItemPreview } from './MenuItemPreview'
import React from 'react'
import { MenuItem } from './MenuItem'
import { Item } from './types'
import { useEffect } from 'react'
import { SortableItem } from './SortableItem'

const INDENTATION = 50

type SortableTreeInputProps = ArrayOfObjectsInputProps

export function SortableTreeInput(props: SortableTreeInputProps) {
  const { onChange, path, onItemAppend, value, schemaType } = props


  const maxDepth = 2

  const isRoot = useMemo(() => path.length === 1, [path])

  const tree = !isRoot ? useTree() : undefined

  const members = useMemo(() => {

    return props.members.filter((member) => member.kind === 'item')
      // Only show members that are in the tree
      // resolves rerendering of portal when flattenedItem is undefined
      .filter(({ key }) => {
        return isRoot || tree?.flattenedItems?.some((item) => item._key === key)
      }).map((member) => {
        return {
          ...member,
          item: {
            ...member.item,
            schemaType: {
              ...member.item.schemaType,
              components: {
                ...member.item.schemaType.components,
                item: MenuItem,
                preview: MenuItemPreview,
              },
            },
          },
        }
      })
  }, [props.members, tree]);

  useEffect(() => {
    console.log('props', props)
  }, [props])

  const sanityArrayItems = (
    <>
      {members.map((member) => (
        <ArrayOfObjectsItem
          {...props}
          key={member.key}
          member={member}
        />
      ))}
    </>
  )

  return isRoot ? (
    <RootTree
      maxDepth={maxDepth || 5}
      indentation={INDENTATION}
      schemaType={schemaType}
      props={props}
      onChange={(items) => {
        onChange(set(items))
      }}
      items={(value || []) as Item[]}
    >
      {sanityArrayItems}
    </RootTree>
  ) : sanityArrayItems
}

function RootTree({
  props,
  maxDepth = 3,
  indentation = 50,
  onChange,
  children,
  schemaType,
  items = [],
}: {
  props: ArrayOfObjectsInputProps
  onChange: (items: Item[]) => void
  items: Item[]
  children: React.ReactNode
  indentation?: number
  maxDepth?: number
  schemaType: SchemaType
}) {
  const [flattenedItems, setFlattenedItems] = useState<FlattenedItem[]>(() => flattenTree(items))

  useEffect(() => {
    setFlattenedItems(flattenTree(items))
  }, [items])

  function shapeMember(member: any, parentProps: any = undefined) {
    return {
      ...member,
      parentProps: parentProps || props,
    };
  }

  function traverseMembers(member: any, depth: number = 0): any[] {
    if (depth >= maxDepth) return [];

    const childrenMenu = member?.item?.members?.find((m) => m.name === 'children');
    const children = childrenMenu?.field?.members;

    if (!children) {
      return [];
    }

    return children.flatMap((child: any) => [
      shapeMember(child, childrenMenu.field),
      ...traverseMembers(child, depth + 1),
    ]);
  }

  const mappedMembers = useMemo(() => {
    const mappedMembers = props.members.flatMap((member) => [
      shapeMember(member),
      ...traverseMembers(member),
    ]);

    return flattenedItems.map((item) => {
      const member = mappedMembers.find((m) => m.key === item._key)

      return {
        ...item,
        member,
      }
    })
  }, [flattenedItems]);

  const initialDepth = useRef(0)
  const sourceChildren = useRef<FlattenedItem[]>([])

  const isLastChild = (item: FlattenedItem) => {
    const siblings = flattenedItems.filter((i) => i.parentId === item.parentId)
    return siblings[siblings.length - 1]?._key === item._key
  }

  const getParentItem = (parentId: string | null) => {
    return parentId ? flattenedItems.find((item) => item._key === parentId) : null
  }

  const canBeNested = (item: FlattenedItem, sourceItem: FlattenedItem) => {
    const hasChildren = item?.member?.item?.members?.find((m) => m.name === 'children')

    if (!hasChildren) {
      return false
    }

    const hasCompatibleType = hasChildren?.field?.schemaType.of.some((type) => {

      const matchedType = type.name === sourceItem.member.item.schemaType.name

      if (matchedType && type.name === 'reference') {
        return type.to.some((parentType) => {
          return sourceItem.member.item.schemaType.to.some((childType) => {
            return childType.name === parentType.name
          })
        })
      }

      return matchedType
    }) 

    return hasCompatibleType
  }

  return (
    <>
      <DragDropProvider
        onDragStart={(event) => {
          const { source } = event.operation

          if (!source) return

          const { depth } = flattenedItems.find(({ _key }) => _key === source.id)!

          setFlattenedItems((flattenedItems) => {
            sourceChildren.current = []

            return flattenedItems.filter((item) => {
              if (item.parentId === source.id) {
                sourceChildren.current = [...sourceChildren.current, item]
                return false
              }

              return true
            })
          })

          initialDepth.current = depth
        }}
        onDragOver={(event, manager) => {
          const { source, target } = event.operation

          event.preventDefault()

          if (source && target && source.id !== target.id) {



            setFlattenedItems((flattenedItems) => {
              const offsetLeft = manager.dragOperation.transform.x
              const dragDepth = getDragDepth(offsetLeft, indentation)
              const projectedDepth = initialDepth.current + dragDepth

              // Prevent dragging items beyond the maximum allowed depth
              // If the projected depth would exceed maxDepth, return the current state unchanged
              if (projectedDepth > maxDepth) {
                return flattenedItems
              }

              const { depth, parentId } = getProjection(flattenedItems, source.id, projectedDepth)

              const targetItem = mappedMembers.find((item) => item._key === parentId);
              const sourceItem = mappedMembers.find((item) => item._key === source.id);

              if (targetItem && !canBeNested(targetItem, sourceItem)) { // Then check if that target is nestable
                return flattenedItems; // Prevent the update
              }

              // Map _key to id for dnd-kit compatibility
              const itemsWithId = flattenedItems.map((item) => ({ ...item, id: item._key }))
              const sortedItemsWithId = move(itemsWithId, event)
              // Map id back to _key and update the moved item
              const newItems = sortedItemsWithId.map((item: FlattenedItem & { id: string }) => {
                const { id, ...rest } = item // Remove the temporary id field
                return item._key === source.id ? { ...rest, depth, parentId } : rest
              })

              return newItems as FlattenedItem[] // Assert type back to FlattenedItem[]
            })
          }
        }}
        onDragMove={(event, manager) => {
          if (event.defaultPrevented) {
            return
          }

          const { source, target } = event.operation

          if (source && target) {
            const keyboard = isKeyboardEvent(event.operation.activatorEvent)
            const currentDepth = source.data!.depth ?? 0
            let keyboardDepth

            if (keyboard) {
              const isHorizontal = event.by?.x !== 0 && event.by?.y === 0

              if (isHorizontal) {
                event.preventDefault()

                keyboardDepth = currentDepth + Math.sign(event.by!.x)

                // Prevent keyboard navigation beyond maxDepth
                // If the keyboard navigation would take the item beyond maxDepth, cancel the operation
                if (keyboardDepth > maxDepth) {
                  return
                }
              }
            }

            const offsetLeft = manager.dragOperation.transform.x
            const dragDepth = getDragDepth(offsetLeft, indentation)

            const projectedDepth = keyboardDepth ?? initialDepth.current + dragDepth

            // Prevent dragging beyond maxDepth
            // If the projected depth would exceed maxDepth, cancel the drag operation
            if (projectedDepth > maxDepth) {
              return
            }

            const { depth, parentId } = getProjection(flattenedItems, source.id, projectedDepth)


            const targetItem = mappedMembers.find((item) => item._key === parentId);
            const sourceItem = mappedMembers.find((item) => item._key === source.id);
            if (targetItem && !canBeNested(targetItem, sourceItem)) { // Then check if that target is nestable
              return flattenedItems; // Prevent the update
            }

            if (keyboard) {
              if (currentDepth !== depth) {
                const offset = indentation * (depth - currentDepth)

                manager.actions.move({
                  by: { x: offset, y: 0 },
                  propagate: false,
                })
              }
            }

            if (source.data!.depth !== depth || source.data!.parentId !== parentId) {
              setFlattenedItems((flattenedItems) => {
                return flattenedItems.map(
                  (
                    item: FlattenedItem, // Add explicit type
                  ) => (item._key === source.id ? { ...item, depth, parentId } : item),
                )
              })
            }
          }
        }}
        onDragEnd={(event) => {
          if (event.canceled) {
            return setFlattenedItems(flattenTree(items))
          }

          const updatedTree = buildTree([...flattenedItems, ...sourceChildren.current])

          setFlattenedItems(flattenTree(updatedTree))

          onChange(updatedTree)
        }}
      >
        <Card border={true} padding={1} radius={2}>
          <Grid gap={1}>
            {mappedMembers.map((item, index) => {
              const parent = getParentItem(item.parentId)
              const renderAddButton = parent && isLastChild(item) && item.depth <= maxDepth

              return (
                <React.Fragment key={item._key}>
                  <SortableItem {...item} index={index} />
                  {renderAddButton && (
                    <div style={{ marginLeft: item.depth * indentation }}>
                      <NewTreeItem
                        parentLabel={parent?.label}
                        schemaType={item.member.parentSchemaType}
                        addItem={(type: string) => {
                          const newItem = {
                            _type: type,
                            _key: randomKey(12),
                          };

                          const pathToArray = [...item.member.parentProps.path]; // Should resolve to `['menu', {_key: 'parent1'}, 'children']`

                          return
                          onChange(
                            PatchEvent.from(
                              insert([newItem], 'after', pathToArray) // 'after' is safe unless you're targeting a specific sibling
                            )
                          );
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
            <NewTreeItem addItem={(type) => {
              props.onItemAppend({
                _type: type,
                _key: randomKey(12),
              })
            }} schemaType={props.schemaType} />
          </Grid>
        </Card>
        <TreeProvider value={{ flattenedItems, setFlattenedItems, indentation, props }}>
          {children}
        </TreeProvider>
        <DragOverlay style={{ width: 'min-content' }}>
          {(source) => <SortableItemOverlay {...source} children={sourceChildren.current} />}
        </DragOverlay>
      </DragDropProvider>
    </>
  )
}
