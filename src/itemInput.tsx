import React from 'react';

import { Flex, Grid } from '@sanity/ui';
import { ObjectInputProps, set } from 'sanity';
import { ContextMenu } from './components/ContextMenu';

export function ItemInput(props: ObjectInputProps) {
    const { members, onChange, path, value } = props;

    const handleLinkChange = (linkValue: string) => {
        onChange(set(value ? { ...value, url: linkValue } : {
            _type: 'menuItem',
            url: linkValue
        }));
    };
    
    return <>
        <style>
            {`
                #item-input [data-ui="fieldHeaderContentBox"] {
                   padding-bottom: 0 !important;
                }
            `}
        </style>
        <Flex gap={1} className='w-full' align="flex-end">
            <Grid id='item-input' columns={2} gap={1} className='w-full'>
                {members.filter((member) => member.kind === 'field').map((member) => props.renderDefault({
                    ...props,
                    members: [member]
                }))}
            </Grid>
            <ContextMenu onClick={handleLinkChange} />
        </Flex>
    </>
}
