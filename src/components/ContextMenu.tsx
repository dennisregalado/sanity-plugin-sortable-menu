import { CogIcon, CopyIcon, EllipsisVerticalIcon, UserIcon } from "@sanity/icons";
import { BasketIcon, SearchIcon, EarthGlobeIcon } from "@sanity/icons";
import { HomeIcon } from "@sanity/icons";
import { Box, Button, Menu, MenuButton, MenuDivider, MenuItem, Text } from "@sanity/ui";

export function ContextMenu({
    items = [],
    onClick
}) {

    const defaultItems = [
        {
            text: "Online Store",
            children: [
                {
                    value: '/',
                    icon: HomeIcon,
                    text: "Homepage",
                },
                {
                    value: '/search',
                    icon: SearchIcon,
                    text: "Search",
                },
                {
                    value: '/cart',
                    icon: BasketIcon,
                    text: "Cart",
                },
                {
                    value: '?selectedCurrency=USD',
                    icon: EarthGlobeIcon,
                    text: "Currency",
                }
            ]
        },
        {
            text: "Customer accounts",
            children: [
                {
                    icon: CopyIcon,
                    text: "Orders",
                    value: '/accounts/orders',
                },
                {
                    icon: UserIcon,
                    text: "Profile",
                    value: '/accounts/profile',
                },
                {
                    icon: CogIcon,
                    text: "Settings",
                    value: '/accounts',
                }
            ]
        }
    ]

    return <MenuButton
        id="link-input-menu"
        button={<Button style={{ height: '33px' }} paddingX={2} mode="bleed" icon={EllipsisVerticalIcon} />}
        menu={<Menu>
            {defaultItems.map((item, index) => (
                <>
                    <Box key={item.text} padding={2}>
                        <Text size={1} weight='medium'>{item.text}</Text>
                    </Box>
                    {item.children ? item.children.map((child) => (
                        <MenuItem onClick={() => onClick(child.value)} key={child.text} icon={child.icon} text={child.text} fontSize={1} />
                    )) : null}
                    {index !== defaultItems.length - 1 && <MenuDivider />}
                </>
            ))}
        </Menu>}
        popover={{ portal: true, placement: 'top' }}
    />

}