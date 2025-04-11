import React from 'react';
import { useTreeItem } from './context/TreeItemContext';
import { ObjectItemProps } from 'sanity';

export function Item(props: ObjectItemProps) {
    const { isEditing } = useTreeItem();

    const inlineProps = {
        ...props.inputProps,
        members: props.inputProps.members.filter((m) => true),
        value: props.value,
    }

    return <>
        <div style={{ width: '100%' }}>
            {isEditing ? (
                inlineProps.renderInput(inlineProps)
            ) : (
                inlineProps.renderPreview(inlineProps)
            )}
        </div>
    </>
}
