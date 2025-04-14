// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { randomKey } from '@sanity/util/content';
import { ArrayOfObjectsInputProps, ArrayOfObjectsItem, ArrayOfObjectsInputMembers, ArrayOfObjectOptionsInput, ArrayOfObjectsInputMember, MemberField, MemberItemError } from 'sanity';
import { set } from 'sanity';
import { Tree } from './components/Tree';
import { Item } from './types';

export function MenuInput(props: ArrayOfObjectsInputProps) {
    const { onChange, schemaType, value } = props;

    const maxDepth = typeof schemaType?.options?.depth === 'number' ? schemaType?.options?.depth : 5;

    const [newItems, setNewItems] = useState<Item[]>(value || [
        {
            _key: randomKey(12),
            _type: 'menuItem',
            id: 'Homepage',
            label: 'Homepage',
            url: '/',
            children: [],
        },
        {
            _key: randomKey(12),
            _type: 'menuItem',
            id: 'Collections',
            label: 'Collections',
            url: '/collections',
            children: [
                {
                    _key: randomKey(12),
                    _type: 'menuItem',
                    id: 'Spring',
                    label: 'Spring',
                    url: '/spring',
                    children: []
                },
                {
                    _key: randomKey(12),
                    _type: 'menuItem',
                    id: 'Summer',
                    label: 'Summer',
                    url: '/summer',
                    children: []
                },
                {
                    _key: randomKey(12),
                    _type: 'menuItem',
                    id: 'Fall',
                    label: 'Fall',
                    url: '/fall',
                    children: []
                },
                {
                    _key: randomKey(12),
                    _type: 'menuItem',
                    id: 'Winter',
                    label: 'Winter',
                    url: '/winter',
                    children: []
                },
            ],
        },
        {
            _key: randomKey(12),
            _type: 'menuItem',
            id: 'About Us',
            label: 'About Us',
            url: '/about-us',
            children: [],
        },
        {
            _key: randomKey(12),
            _type: 'menuItem',
            id: 'My Account',
            label: 'My Account',
            url: '/my-account',
            children: [
                {
                    _key: randomKey(12),
                    _type: 'menuItem',
                    id: 'Addresses',
                    label: 'Addresses',
                    url: '/addresses',
                    children: []
                },
                {
                    _key: randomKey(12),
                    _type: 'menuItem',
                    id: 'Order History',
                    label: 'Order History',
                    url: '/order-history',
                    children: []
                },
            ],
        },
    ]);

    const handleChange = (items: Item[]) => {
        setNewItems(items);
        onChange(set(items));
    }

    function traverseMembers(member: any, currentDepth: number = 0) {
        if (currentDepth >= maxDepth) {
            return [];
        }

        const childrenMenu = member.item.members.find((child) => child.name === 'children');

        if (!childrenMenu || !childrenMenu.field.members) {
            return [shapeMember(member, childrenMenu.field)];
        }

        return childrenMenu.field.members.reduce((acc, member) => {
            const childMembers = traverseMembers(member, currentDepth + 1);
            return [...acc, shapeMember(member, childrenMenu.field), ...childMembers];
        }, []);
    }

    function shapeMember(member: any, parentProps: any) {
        if (parentProps) { 
            return {
                ...member,
                collapsed: false,
                parentProps: {
                    ...props,
                    ...parentProps, 
                }
            }
        }
        return {
            ...member,
            collapsed: false,
            parentProps: {
                ...props,
                onChange: null
            }
        }
    }

    const flattenedMembers = useMemo(() => {
        return props.members.reduce((acc, member) => {
            const childMembers = traverseMembers(member);

            const shapedMember = shapeMember(member);

            return [...acc, shapedMember, ...childMembers];
        }, []);
    }, [props.members, maxDepth]);

    useEffect(() => {
        console.log('flattenedMembers', flattenedMembers)
    }, [flattenedMembers])

    return <Tree context={props} members={flattenedMembers} maxDepth={maxDepth} items={newItems} onChange={handleChange} />
}
 