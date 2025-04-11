import { useSortable } from '@dnd-kit/react/sortable';
import { CheckmarkIcon, ChevronDownIcon, ChevronRightIcon, DragHandleIcon, EditIcon, TrashIcon, ErrorOutlineIcon } from '@sanity/icons';
import { Box, Button, Card, Flex, Text, Tooltip } from '@sanity/ui';
import { FlattenedItem } from '../types';
import { useState } from 'react';
import { TreeItemProvider, useTreeItem } from '../context/TreeItemContext';

export interface Props extends FlattenedItem {
  onRemove?(): void;
  editing?: React.ReactNode;
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

export function TreeItem({ depth, id, index, parentId, onRemove, label = '', url = '', editing, children = [] }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const { ref, handleRef, isDragSource, isDragging } = useSortable({
    ...config,
    id,
    index,
    data: {
      depth,
      parentId,
    },
  });

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
          toggleCollapse={() => setCollapsed(!collapsed)}
          removeButton={<Button mode="bleed" paddingX={2} icon={TrashIcon} tone="critical" onClick={onRemove} />}
          dragButton={<Button ref={handleRef} paddingX={2} mode="bleed" icon={DragHandleIcon} style={{ cursor: 'all-scroll' }} />}
        >
          {editing}
        </MenuItem>
      </li>
    </TreeItemProvider>
  );
}

export function MenuItem({ removeButton, dragButton, isDragging, children, hasChildren, collapsed, toggleCollapse }: { removeButton?: React.ReactNode, dragButton?: React.ReactNode, isDragging: boolean, label: string, children: React.ReactNode, hasChildren: boolean, url: string, collapsed: boolean, toggleCollapse: () => void }) {
  const { isEditing, setIsEditing, isHovering, setIsHovering } = useTreeItem();
  const hasError = false;

  return <Card
    padding={1}
    radius={2}
    shadow={(!isHovering && isDragging) ? 5 : 0}
    tone={hasError && !isEditing ? 'critical' : isHovering && !isDragging && !isEditing ? 'transparent' : 'inherit'}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
  >
    <Flex gap={1} width="fill" align={isEditing ? 'flex-end' : 'center'} paddingBottom={isEditing ? 3 : 0}>

      {dragButton}
      {hasChildren && (
        <Button mode="bleed" paddingX={2} icon={collapsed ? ChevronRightIcon : ChevronDownIcon} onClick={toggleCollapse} />
      )}
      <Flex width="fill" className='w-full' style={{ width: '100%' }}>
        {children}
      </Flex>
      {hasError && !isHovering && !isEditing ? (
        <Box paddingX={2}>
          <Text size={1} weight='medium'>
            <ErrorOutlineIcon />
          </Text>
        </Box>
      ) : (isHovering || isEditing) && (
        <Flex gap={1} className='shrink-0'>
          {isEditing ?
            <Button paddingX={2} mode="bleed" icon={CheckmarkIcon} onClick={() => setIsEditing(false)} /> :
            <Button paddingX={2} mode="bleed" icon={EditIcon} onClick={() => setIsEditing(true)} />}
          {removeButton}
        </Flex>
      )}
    </Flex>
  </Card >
}
