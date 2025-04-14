import React, { useEffect } from 'react';
import { useTreeItem } from './hooks/useTreeItem';
import { ObjectItemProps, set } from 'sanity';
import { getToneFromValidation } from './validation';

export function TestItem(props: ObjectItemProps) {
    const { children: Children, ...rest } = props;

    console.log('testItem', props)
   
 
    return <>
        <code>testItem.tsx</code>
        {props.renderDefault(props)}
    </>
}  
