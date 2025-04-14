import React, { useEffect } from 'react';
import { useTreeItem } from './hooks/useTreeItem';
import { ObjectItemProps, set } from 'sanity';
import { getToneFromValidation } from './validation';

export function Item(props: ObjectItemProps) {
    const { children: Children, ...rest } = props;
    const { isEditing, setValidation } = useTreeItem();

    const inlineProps = {
        ...props.inputProps,
    }

    useEffect(() => {
        const member = props.inputProps.members[0]

        if (member && member?.field) {
            setValidation(getToneFromValidation(member.field?.validation))

        }
    }, [props.inputProps.members])


    return <>
        <code>item.tsx</code>
        {props.renderDefault(props)}
        {isEditing ? (
            inlineProps.renderInput(props.inputProps)
        ) : (
            inlineProps.renderPreview(inlineProps)
        )}
        <code>children</code>
        {inlineProps.renderInput(props.inputProps)}
    </>
} 
