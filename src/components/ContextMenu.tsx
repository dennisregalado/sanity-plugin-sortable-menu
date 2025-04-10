import { CogIcon, CopyIcon, UserIcon } from "@sanity/icons";
import { BasketIcon, SearchIcon } from "@sanity/icons";
import { HomeIcon } from "@sanity/icons";
import { Box, Menu, MenuDivider, MenuItem, Text } from "@sanity/ui";

export function ContextMenu({
    items = []
}) {

    const defaultItems = [
        {
            text: "Online Store",
            children: [
                {
                    icon: HomeIcon,
                    text: "Homepage",
                },
                {
                    icon: SearchIcon,
                    text: "Search",
                },
                {
                    icon: BasketIcon,
                    text: "Cart",
                }
            ]
        },
        {
            text: "Customer accounts",
            children: [
                {
                    icon: CopyIcon,
                    text: "Orders",
                },
                {
                    icon: UserIcon,
                    text: "Profile",
                },
                {
                    icon: CogIcon,
                    text: "Settings",
                }
            ]
        }
    ]

    return <Menu>
        {defaultItems.map((item, index) => (
            <>
                <Box key={item.text} padding={2}>
                    <Text size={1} weight='medium'>{item.text}</Text>
                </Box>
                {item.children ? item.children.map((child) => (
                    <MenuItem key={child.text} icon={child.icon} text={child.text} fontSize={1} />
                )) : null}
                {index !== defaultItems.length - 1 && <MenuDivider />}
            </>
        ))}
    </Menu>
}