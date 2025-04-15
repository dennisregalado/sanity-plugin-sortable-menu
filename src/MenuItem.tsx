// @ts-nocheck
import React, { useMemo, useState, useRef, useEffect } from 'react'
import { TreeItemProvider, useTreeItem } from './hooks/useTreeItem'
import { ObjectItemProps } from 'sanity'
import {
  CheckmarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DragHandleIcon,
  EditIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
} from '@sanity/icons'
import { Button, Card, CardTone, Flex, Text, Tooltip } from '@sanity/ui'
import { useSortable } from '@dnd-kit/react/sortable'
import { useTree } from './hooks/useTree'
import { createPortal } from 'react-dom'
import { getToneFromValidation } from './validation'

const config = {
  alignment: {
    x: 'start',
    y: 'center',
  },
  transition: {
    idle: true,
  },
} as const

export function MenuItem(props: ObjectItemProps) {
  const { value, onRemove, path } = props

  const { flattenedItems } = useTree()
  const rootTree = useRef(null)

  const flattenedItem = useMemo(() => {
    return (flattenedItems || [])?.find((item) => item._key === value._key)
  }, [flattenedItems, value])

  const hasChildren = useMemo(() => {
    return value.children?.length > 0
  }, [value])

  const inlineEditingProps = {
    ...props.inputProps,
    members: props.inputProps.members.filter(
      (member) => member.kind == 'field' && member.name !== 'children',
    ),
  }

  const childrenProps = {
    ...props.inputProps,
    members: props.inputProps.members.filter(
      (member) => member.kind == 'field' && member.name == 'children',
    ),
  }

  const [isEditing, setIsEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [validation, setValidation] = useState<CardTone | undefined>(undefined)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {

    const element = document.querySelector(`[data-root-tree="${value?._key}"]`)
   
    if (element) {
      rootTree.current = element
      return
    }


    const timer = setTimeout(() => {
      const element = document.querySelector(`[data-root-tree="${value?._key}"]`)
      if (element) {
        rootTree.current = element
        // Force a re-render if needed, though setting state/ref usually triggers it.
        // Consider if you need an explicit state update here to force re-render
        // For example: setSomeState(prev => !prev)
      }
    }, 0); // 0ms timeout often pushes execution after the current render cycle

    // Cleanup function to clear the timeout if the component unmounts
    // or dependencies change before the timeout executes.
    return () => clearTimeout(timer);
  }, [props.inputId]) // Ensure dependency array is correct

  useEffect(() => {
    const member = props.inputProps.members[0]

    if (member && member?.field) {
      setValidation(getToneFromValidation(member.field?.validation))
    }
  }, [props.inputProps.members])

  const depth = useMemo(() => {
    return flattenedItem?.depth ?? 0
  }, [flattenedItem])

  const index = useMemo(() => {
    return flattenedItem?.index ?? 0
  }, [flattenedItem])

  const hasInputComponent = useMemo(() => {
    return Boolean(props.schemaType.components?.input)
  }, [props.schemaType])

  return (
    <>
      {rootTree.current &&
        createPortal(
          <TreeItemProvider value={{ isEditing, setIsEditing, isHovering, setIsHovering }}>
            {hasChildren && (
              <Tooltip
                content={<Text size={1}>{collapsed ? 'Expand' : 'Collapse'}</Text>}
                animate
                fallbackPlacements={['right', 'left']}
                placement="bottom"
                portal
              >
                <Button
                  mode="bleed"
                  paddingX={2}
                  icon={collapsed ? ChevronRightIcon : ChevronDownIcon}
                  onClick={() => setCollapsed(!collapsed)}
                />
              </Tooltip>
            )}
            <style>
              {`
          #menu-item > div {
            width: 100%;
          }
        `}
            </style>
            <Flex width="fill" style={{ width: '100%' }} id="menu-item">
              {isEditing && hasInputComponent ? (
                inlineEditingProps.renderInput(inlineEditingProps)
              ) : (
                <Button
                  mode="bleed"
                  width="fill"
                  height={34}
                  paddingY={0}
                  paddingX={2}
                  onClick={() => (hasInputComponent ? setIsEditing(true) : props.onOpen(path))}
                  textAlign="left"
                  style={{ width: '100%', height: '33px' }}
                >
                  {props.inputProps.renderPreview(props.inputProps)}
                </Button>
              )}
            </Flex>
            {(isHovering || isEditing) && (
              <Flex gap={1} style={{ flexShrink: 0 }}>
                {isEditing ? (
                  <Tooltip
                    content={<Text size={1}>Preview</Text>}
                    animate
                    fallbackPlacements={['right', 'left']}
                    placement="bottom"
                    portal
                  >
                    <Button
                      paddingX={2}
                      mode="bleed"
                      icon={CheckmarkIcon}
                      onClick={() => setIsEditing(false)}
                    />
                  </Tooltip>
                ) : !hasInputComponent ? (
                  <Tooltip
                    content={<Text size={1}>Open</Text>}
                    animate
                    fallbackPlacements={['right', 'left']}
                    placement="bottom"
                    portal
                  >
                    <Button paddingX={2} mode="bleed" icon={EllipsisHorizontalIcon} />
                  </Tooltip>
                ) : (
                  <Tooltip
                    content={<Text size={1}>Edit</Text>}
                    animate
                    fallbackPlacements={['right', 'left']}
                    placement="bottom"
                    portal
                  >
                    <Button
                      paddingX={2}
                      mode="bleed"
                      icon={EditIcon}
                      onClick={() => setIsEditing(true)}
                    />
                  </Tooltip>
                )}
                <Tooltip
                  content={<Text size={1}>Remove</Text>}
                  animate
                  fallbackPlacements={['right', 'left']}
                  placement="bottom"
                  portal
                >
                  <Button
                    mode="bleed"
                    onClick={onRemove}
                    paddingX={2}
                    icon={TrashIcon}
                    tone="critical"
                  />
                </Tooltip>
              </Flex>
            )}
          </TreeItemProvider>,
          rootTree.current,
        )}
      <div style={{ display: 'none' }} key={value.children?.length}>
        {childrenProps.renderInput(childrenProps)}
      </div>
    </>
  )
}
