import { useSortable } from '@dnd-kit/react/sortable';
import { CheckmarkIcon, ChevronDownIcon, ChevronRightIcon, DragHandleIcon, EditIcon, TrashIcon, ErrorOutlineIcon } from '@sanity/icons';
import { Box, Button, Card, Flex, Text, Tooltip } from '@sanity/ui';
import { FlattenedItem } from '../types';
import { useState } from 'react';
import { TreeItemProvider, useTreeItem } from '../hooks/useTreeItem';

export interface Props extends FlattenedItem {
  onRemove?(): void;
  editing?: React.ReactNode;
  collapsed?: boolean;
  onCollapse?(isCollapsed: boolean): void;
}

const INDENTATION = 50;

const config = {
  alignment: {
    x: 'start',
    y: 'center',
  },
  transition: {
    idle: true,
  },
} as const;

export function TreeItem({ depth, id, index, parentId, onRemove, label = '', url = '', editing, children = [], collapsed = false, onCollapse }: Props) {
  const { ref, handleRef, isDragSource, isDragging, isDropping, isDropTarget } = useSortable({
    ...config,
    id,
    index,
    data: {
      depth,
      parentId,
    },
  });

  const dragButton = handleRef ? (
    <Button ref={handleRef} paddingX={2} mode="bleed" icon={DragHandleIcon} style={{ cursor: 'all-scroll' }} />
  ) : undefined;

  const removeButton = onRemove ? (
    <Button mode="bleed" paddingX={2} icon={TrashIcon} tone="critical" onClick={onRemove} />
  ) : undefined;

  return (
    <TreeItemProvider>
      <li
        ref={ref}
        style={{
          marginLeft: depth * INDENTATION,
          ...(isDragging && {
            zIndex: 5,
            position: 'relative',
          }),
        }}
        aria-hidden={isDragSource}
      >
        <MenuItem
          url={url}
          label={label}
          hasChildren={children.length > 0}
          isDragging={isDragging}
          collapsed={collapsed}
          toggleCollapse={() => onCollapse?.(!collapsed)}
          removeButton={removeButton}
          dragButton={dragButton}
        >
          {editing}
        </MenuItem>
      </li>
    </TreeItemProvider>
  );
}

interface MenuItemProps {
  removeButton?: React.ReactElement;
  dragButton?: React.ReactElement;
  isDragging: boolean;
  label: string;
  children: React.ReactNode;
  hasChildren: boolean;
  url: string;
  collapsed: boolean;
  toggleCollapse: () => void;
}

export function MenuItem({ removeButton, dragButton, isDragging, children, hasChildren, collapsed, toggleCollapse }: MenuItemProps) {
  const { isEditing, setIsEditing, isHovering, setIsHovering, validation } = useTreeItem();

  return <Card
    padding={1}
    radius={2}
    shadow={(!isHovering && isDragging) ? 5 : 0}
    tone={validation && !isEditing ? validation : isHovering && !isDragging && !isEditing ? 'transparent' : 'inherit'}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
  >
    <Flex gap={1} width="fill" align={isEditing ? 'flex-end' : 'center'} paddingBottom={isEditing ? 3 : 0}>
      {dragButton && (
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
          {dragButton}
        </Tooltip>
      )}

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
          <Button mode="bleed" paddingX={2} icon={collapsed ? ChevronRightIcon : ChevronDownIcon} onClick={toggleCollapse} />
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
        {children}
      </Flex>
      {validation && !isHovering && !isEditing ? (
        <Box paddingX={2}>
          <Text size={1} weight='medium'>
            <ErrorOutlineIcon />
          </Text>
        </Box>
      ) : (isHovering || isEditing) && removeButton && (
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
            {removeButton}
          </Tooltip>
        </Flex>
      )}
    </Flex>
  </Card>
}
