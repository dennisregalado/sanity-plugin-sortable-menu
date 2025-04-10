import { useSortable } from '@dnd-kit/react/sortable';
import { CheckmarkIcon, ChevronDownIcon, ChevronRightIcon, DragHandleIcon, EditIcon, EllipsisVerticalIcon, TrashIcon } from '@sanity/icons';
import { Autocomplete, Avatar, Box, Button, Card, Flex, Grid, MenuButton, Text, TextInput } from '@sanity/ui';
import { FlattenedItem } from '../types';
import { useState } from 'react';
import { ContextMenu } from './ContextMenu';

export interface Props extends FlattenedItem {
  onRemove?(): void;
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

export function TreeItem({ depth, id, index, parentId, onRemove, label = '', url = '', children }: Props) {

  const [collapsed, setCollapsed] = useState(false);

  const { ref, handleRef, isDragSource, isDragging } = useSortable({
    ...config,
    id,
    index,
    data: {
      depth,
      parentId,
      collapsed: false,
    },
  });

  return (
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
        removeButton={<Button mode="bleed" icon={TrashIcon} tone="critical" onClick={onRemove} />}
        dragButton={<Button ref={handleRef} paddingX={2} mode="bleed" icon={DragHandleIcon} style={{ cursor: 'all-scroll' }} />}
      />
    </li>
  );
}

export function MenuItem({ removeButton, dragButton, isDragging, label, hasChildren, url, collapsed, toggleCollapse }: { removeButton?: React.ReactNode, dragButton?: React.ReactNode, isDragging: boolean, label: string, hasChildren: boolean, url: string, collapsed: boolean, toggleCollapse: () => void }) {

  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return <Card
    padding={1}
    radius={2}
    shadow={(!isHovering && isDragging) ? 5 : 0}
    tone={isHovering && !isDragging && !isEditing ? 'transparent' : 'inherit'}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
  >
    <Flex gap={1} width="fill" align={isEditing ? 'flex-end' : 'center'} paddingBottom={isEditing ? 3 : 0}>
      {dragButton}
      {hasChildren && (
        <Button mode="bleed" paddingX={2} icon={collapsed ? ChevronRightIcon : ChevronDownIcon} onClick={toggleCollapse} />
      )}
      <Flex className='w-full'>
        {isEditing ? (
          <Grid columns={2} gap={1} paddingLeft={2} className='w-full'>
            <LabelInput value={label} onChange={() => { }} />
            <LinkInput value={url} onChange={() => { }} />
          </Grid>
        ) : (
          <Button mode={"bleed"} width="fill" paddingY={3} paddingX={2} onClick={() => setIsEditing(true)} textAlign='left'>
            <Text size={1} weight='medium'>{label || 'Untitled'}</Text>
          </Button>
        )}
      </Flex>
      {(isHovering || isEditing) && (
        <Flex gap={1} className='shrink-0'>
          {isEditing ?
            <Button paddingX={2} mode="bleed" icon={CheckmarkIcon} onClick={() => setIsEditing(false)} /> :
            <Button paddingX={2} mode="bleed" icon={EditIcon} onClick={() => setIsEditing(true)} />}
          {removeButton}
        </Flex>
      )}
    </Flex>
  </Card>
}

function LabelInput(props: { value: string, onChange: (value: string) => void }) {

  return (
    <Card paddingTop={3}>
      <Grid gap={3} className='w-full text-left'>
        <Text size={1} weight='medium'>Label</Text>
        <TextInput
          fontSize={2}
          onChange={(event) =>
            props.onChange(event.currentTarget.value)
          }
          placeholder="e.g. Homepage"
          value={props.value}
        />
      </Grid>
    </Card>
  )
}

function LinkInput(props: { value: string, onChange: (value: string) => void }) {
  return (
    <Card paddingTop={3} className="w-full">
      <Grid gap={3} className='w-full text-left'>
        <Text size={1} weight='medium'>Link</Text>
        <Card className='w-full'>
          <Flex gap={1} className='w-full'>
            <div className='w-full [&>*]:w-full'>
              <Autocomplete
                id="link-input"
                value={props.value}
                onClick={() => {
                  console.log('clicked')
                }}
                filterOption={(query, option) =>
                  option.payload.name
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) > -1
                }
                fontSize={2}
                options={[
                  {
                    value: 'mikolajdobrucki',
                    payload: {
                      color: 'purple',
                      userId: 'mikolajdobrucki',
                      name: 'Mikołaj Dobrucki',
                      imageUrl:
                        'https://avatars.githubusercontent.com/u/5467602?v=4',
                    },
                  },
                  {
                    value: 'mariuslundgard',
                    payload: {
                      color: 'blue',
                      userId: 'mariuslundgard',
                      name: 'Marius Lundgård',
                      imageUrl:
                        'https://avatars.githubusercontent.com/u/406933?v=4',
                    },
                  },
                  {
                    value: 'vicbergquist',
                    payload: {
                      color: 'cyan',
                      userId: 'vicbergquist',
                      name: 'Victoria Bergquist',
                      imageUrl:
                        'https://avatars.githubusercontent.com/u/25737281?v=4',
                    },
                  },
                ]}
                placeholder="Search or paste link"
                renderOption={(option) => (
                  <Card as="button">
                    <Flex align="center">
                      <Box padding={1}>
                        <Avatar
                          size={1}
                          src={option.payload.imageUrl}
                        />
                      </Box>
                      <Box flex={1} padding={2} paddingLeft={1}>
                        <Text size={2}>
                          {option.payload.name}
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                )}
                renderValue={(value, option) =>
                  option?.payload.name || value
                }
                onSelect={value => props.onChange(value)}
              />
            </div>
            <MenuButton
              id="link-input-menu"
              button={<Button paddingX={2} mode="bleed" icon={EllipsisVerticalIcon} />}
              menu={<ContextMenu />}
              popover={{ portal: true, placement: 'top' }}
            />
          </Flex>
        </Card>
      </Grid>
    </Card>
  )
}