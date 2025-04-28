import { AddIcon } from '@sanity/icons'
import { Button, Grid, Popover, useClickOutsideEvent } from '@sanity/ui'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ArraySchemaType } from 'sanity'

export function NewTreeItem({
  parentLabel,
  addItem,
  schemaType,
}: {
  parentLabel: string
  addItem: (type: string) => void
  schemaType?: ArraySchemaType
}) {
  if (!schemaType) {
    return null
  }

  const hasMultipleTypes = useMemo(() => {
    return schemaType?.of?.length > 1
  }, [schemaType])

  const [isOpen, setIsOpen] = useState(false)

  const buttonElement = useRef<HTMLDivElement | null>(null)

  const handleClickOutside = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
    }
  }, [isOpen])

  useClickOutsideEvent(handleClickOutside, () => [buttonElement.current])

  if (hasMultipleTypes) {
    return (<Popover
      content={<Grid ref={buttonElement} gap={1}>
        {schemaType.of.map((item) => (
          <Button
            mode="bleed"
            justify="flex-start"
            text={item.title}
            textAlign="left"
            onClick={() => {
              addItem(item.name)
              setIsOpen(false)
            }}
            tone="suggest"
            padding={2}
          />
        ))}
      </Grid>}
      padding={1}
      placement="left-start"
      portal
      open={isOpen}
    >
      <Button
        mode="bleed"
        icon={AddIcon}
        justify="flex-start"
        text={parentLabel ? `Add items to ${parentLabel}` : 'Add items'}
        textAlign="left"
        onClick={() => setIsOpen(!isOpen)}
        tone="suggest"
        width="fill"
        padding={2}
      />
    </Popover>)
  }

  return (
    <Button
      mode="bleed"
      icon={AddIcon}
      justify="flex-start"
      text={`Add ${schemaType.of[0].title?.toLocaleLowerCase()}`}
      textAlign="left"
      onClick={() => addItem(schemaType.of[0].name)}
      tone="suggest"
      width="fill"
      padding={2}
    />
  )
}
