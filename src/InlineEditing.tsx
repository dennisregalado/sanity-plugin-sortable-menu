// @ts-nocheck
import React, { useCallback, useMemo } from 'react';
import { Flex, Grid, Text } from '@sanity/ui';
import { ObjectInputProps, set } from 'sanity';
import { ContextMenu } from './components/ContextMenu';

export const defaultMenu = [
    {
        label: "Online Store",
        children: [
            {
                value: '/',
                icon: () => <Text>🏡</Text>,
                label: "Homepage",
            },
            {
                value: '/search',
                icon: () => <Text>🔍</Text>,
                label: "Search",
            },
            {
                value: '/collections/all',
                icon: () => <Text>🛍️</Text>,
                label: "Shop All",
            },
            {
                value: '/cart',
                icon: () => <Text>🛒</Text>,
                label: "Cart",
            },
            {
                value: '?currency=true',
                icon: () => <Text>💱</Text>,
                label: "Currency",
            }
        ]
    },
    {
        label: "Customer accounts",
        children: [
            {
                icon: () => <Text>📦</Text>,
                label: "Orders",
                value: '/accounts/orders',
            },
            {
                icon: () => <Text>👤</Text>,
                label: "Profile",
                value: '/accounts/profile',
            },
            {
                icon: () => <Text>⚙️</Text>,
                label: "Settings",
                value: '/accounts',
            }
        ]
    }
]

export function InlineEditing(props: ObjectInputProps) {

    const isChildrenMember = useMemo(() => {
        return props.members.some((member) => member.kind === 'field' && member.name === 'children')
    }, [props.members])

    if (isChildrenMember) {
        return props.renderDefault(props)
    }

    const { members, onChange, value, path } = props;

    const handleLinkChange = useCallback((item: { label: string, value: string }) => {

        let label = value?.label || item?.label;

        onChange(set(value ? {
            ...value,
            _type: 'menuItem',
            url: item.value,
            label,
        } : {
            label,
            _type: 'menuItem',
            url: item.value,
        }));
    }, [onChange, value, path]);

    return <>
        <style>
            {`
                #item-input [data-ui="fieldHeaderContentBox"] {
                   padding-bottom: 0 !important;
                }

                #item-input > div {
                   width: 100%;
                }
            `}
        </style>
        <Flex gap={1} align="flex-end" id='item-input'>
            <Grid columns={2} gap={1}>
                {members.filter((member) => member.kind === 'field' && member.name !== 'children').map((member) => props.renderDefault({
                    ...props,
                    members: [member]
                }))}
            </Grid>
            <ContextMenu
                menu={defaultMenu}
                value={value}
                onClick={handleLinkChange} />
        </Flex>
    </>
}
