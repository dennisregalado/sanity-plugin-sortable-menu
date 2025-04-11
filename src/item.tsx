import React, { useEffect } from 'react';
import { useTreeItem } from './hooks/useTreeItem';
import { ObjectItemProps } from 'sanity';
import { getToneFromValidation } from './validation';

export function Item(props: ObjectItemProps) {
    const { isEditing, setValidation } = useTreeItem();

    const inlineProps = {
        ...props.inputProps,
        members: props.inputProps.members.filter((m) => true),
        value: props.value,
    }

    useEffect(() => {
        const member = props.inputProps.members[0] 

        if (member && member?.field) {
            setValidation(getToneFromValidation(member.field?.validation))

        }
    }, [props.inputProps.members])

    return <>
        {isEditing ? (
            inlineProps.renderInput(inlineProps)
        ) : (
            inlineProps.renderPreview(inlineProps)
        )}
    </>
}
