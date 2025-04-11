// @ts-nocheck
import React, { useState, useEffect } from 'react';
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

    return <Tree context={props} members={props.members} maxDepth={maxDepth} items={newItems} onChange={handleChange} />
}
