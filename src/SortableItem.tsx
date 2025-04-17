import { useSortable } from '@dnd-kit/react/sortable'
import { DragHandleIcon } from '@sanity/icons'
import { Tooltip, Text, Button, CardTone, Flex, Card } from '@sanity/ui'
import { useState } from 'react'
import { TreeItemProvider } from './hooks/useTreeItem'

const INDENTATION = 50

export function SortableItem({ depth, _key, index, parentId }: any) {

  const { ref, handleRef, isDragSource, isDragging } = useSortable({
    alignment: {
      x: 'start',
      y: 'center',
    },
    transition: { 
      idle: true,
    },
    id: _key,
    index,
    data: {
      depth,
      parentId,
    },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  return (
    <TreeItemProvider value={{ isEditing, setIsEditing, isHovering, setIsHovering }}>
      <div
        ref={ref}
        style={{
          ...(isDragging && {
            zIndex: 5,
            position: 'relative',
          }),
          marginLeft: depth * INDENTATION,
        }}
        aria-hidden={isDragSource}
      >
        <Card
          tone={isHovering && !isDragging && !isEditing ? 'transparent' : 'inherit'}
          padding={1}
          radius={2}
          shadow={!isHovering && isDragging ? 5 : 0}
          tone={isHovering && !isDragging && !isEditing ? 'transparent' : 'inherit'}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Flex
            gap={1}
            width="fill"
            align={isEditing ? 'flex-end' : 'center'}
            paddingBottom={isEditing ? 3 : 0}
          >
            <Tooltip
              content={<Text size={1}>Drag to re-order</Text>}
              animate
              fallbackPlacements={['right', 'left']}
              placement="bottom"
              portal
            >
              <Button
                ref={handleRef}
                paddingX={2}
                mode="bleed"
                icon={DragHandleIcon}
                style={{ cursor: 'all-scroll' }}
              />
            </Tooltip>
            <div data-root-tree={_key} style={{ display: 'contents' }}></div>
          </Flex>
        </Card>
      </div>
    </TreeItemProvider>
  )
}
