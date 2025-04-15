import {EllipsisVerticalIcon} from '@sanity/icons'
import {Box, Button, Menu, MenuButton, MenuDivider, MenuItem, Text} from '@sanity/ui'

export function ContextMenu({
  menu,
  onClick,
}: {
  value: {label: string; value: string}
  menu: {
    label: string
    value: string
    children?: {label: string; value: string; icon?: React.ReactNode}[]
  }[]
  onClick: (item: {label: string; value: string}) => void
}) {
  return (
    <MenuButton
      id="link-input-menu"
      button={
        <Button style={{height: '33px'}} paddingX={2} mode="bleed" icon={EllipsisVerticalIcon} />
      }
      menu={
        <Menu>
          {menu.map((item, index) => (
            <>
              <Box key={item.label} padding={2}>
                <Text size={1} weight="medium">
                  {item.label}
                </Text>
              </Box>
              {item.children
                ? item.children.map((child) => (
                    <MenuItem
                      onClick={() => {
                        onClick({label: child.label, value: child.value})
                      }}
                      key={child.label}
                      icon={child.icon}
                      text={child.label}
                      fontSize={1}
                    />
                  ))
                : null}
              {index !== menu.length - 1 && <MenuDivider />}
            </>
          ))}
        </Menu>
      }
      popover={{portal: true, placement: 'top'}}
    />
  )
}
