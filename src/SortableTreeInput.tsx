// @ts-nocheck
import { ArrayOfObjectsInputProps, ArrayOfObjectsItem, SchemaType } from 'sanity'
import { NewTreeItem } from './NewSortableItem'
import { randomKey } from '@sanity/util/content'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useFormValue, set } from 'sanity'
import { Card, Grid } from '@sanity/ui'
import { SortableItemOverlay } from './SortableItemOverlay'
import { DragOverlay, DragDropProvider } from '@dnd-kit/react'
import { FlattenedItem } from './types'
import { buildTree, flattenTree, getDragDepth, getProjection } from './utils'
import { isKeyboardEvent } from '@dnd-kit/dom/utilities'
import { move } from '@dnd-kit/helpers'
import { TreeProvider } from './hooks/useTree'
import { MenuItemPreview } from './MenuItemPreview'
import React from 'react'
import { MenuItem } from './MenuItem'
import { Item } from './types'
import { useEffect } from 'react'
import { SortableItem } from './SortableItem'

const INDENTATION = 50

export function SortableTreeInput(props: ArrayOfObjectsInputProps) {
  const { onChange, path, onItemAppend, value, schemaType } = props

  const isRoot = useMemo(() => path.length === 1, [path])
  const hasChildren = useMemo(() => value && value.length > 0, [value])
  const parentPath = useMemo(() => path.slice(0, -1), [path])
  const parentValue = useFormValue(parentPath) as { label?: string; _key?: string } | undefined

  const parentDepth = useMemo(() => {
    return path.reduce<number>((acc, curr) => {
      if (curr === 'children') {
        return acc + 1
      }

      return acc
    }, 0)
  }, [path])

  const onAddItem = useCallback(
    async (type: string) => {
      const item = {
        _key: randomKey(12),
        _type: type,
        parentId: parentValue?._key,
        depth: parentDepth,
        index: value?.length || 0,
      }

      onItemAppend(item)
    },
    [onChange],
  )

  const maxDepth = 2

  const sanityArrayItems = (
    <>
      {props.members
        .filter((member) => member.kind === 'item')
        .map((member) => (
          <ArrayOfObjectsItem
            {...props}
            key={member.key}
            member={{
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
            }}
          />
        ))}
    </>
  )

  return isRoot ? (
    <RootTree
      maxDepth={maxDepth || 5}
      indentation={INDENTATION}
      onAddItem={onAddItem}
      schemaType={schemaType}
      onChange={(items) => {
        onChange(set(items))
      }}
      items={(value || []) as Item[]}
    >
      {sanityArrayItems}
    </RootTree>
  ) : (
    sanityArrayItems
  )
}

function RootTree({
  props,
  maxDepth = 3,
  indentation = 50,
  onChange,
  children,
  onAddItem,
  schemaType,
  items = [],
}: {
  props: ArrayOfObjectsInputProps
  onChange: (items: Item[]) => void
  items: Item[]
  children: React.ReactNode
  indentation?: number
  maxDepth?: number
  onAddItem: (type: string) => void
  schemaType: SchemaType
}) {
  const [flattenedItems, setFlattenedItems] = useState<FlattenedItem[]>(() => flattenTree(items))

  useEffect(() => {
    setFlattenedItems(flattenTree(items))
  }, [items])

  const initialDepth = useRef(0)
  const sourceChildren = useRef<FlattenedItem[]>([])

  const isLastChild = (item: FlattenedItem) => {
    const siblings = flattenedItems.filter((i) => i.parentId === item.parentId)
    return siblings[siblings.length - 1]?._key === item._key
  }

  const getParentItem = (parentId: string | null) => {
    return parentId ? flattenedItems.find((item) => item._key === parentId) : null
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

              const { depth, parentId } = getProjection(flattenedItems, target.id, projectedDepth)

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
            {flattenedItems.map((item, index) => {
              const parent = getParentItem(item.parentId)
              const renderAddButton = parent && isLastChild(item) && item.depth <= maxDepth

              return (
                <React.Fragment key={item._key}>
                  <SortableItem key={item._key} {...item} index={index}>
                    <div data-root-tree={item._key} style={{ display: 'contents' }}></div>
                  </SortableItem>
                  {renderAddButton && (
                    <div style={{ marginLeft: item.depth * indentation, marginTop: 2 }}>
                      <NewTreeItem
                        parentLabel={parent?.label}
                        schemaType={schemaType}
                        addItem={onAddItem}
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
            <NewTreeItem addItem={onAddItem} schemaType={schemaType} />
          </Grid>
        </Card>
        <TreeProvider value={{ flattenedItems, setFlattenedItems, maxDepth, indentation, props }}>
          {children}
        </TreeProvider>
        <DragOverlay style={{ width: 'min-content' }}>
          {(source) => <SortableItemOverlay {...source} children={sourceChildren.current} />}
        </DragOverlay>
      </DragDropProvider>
    </>
  )
}
