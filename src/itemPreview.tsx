import React from 'react';
import { Button, Text, Flex } from '@sanity/ui';
import { useTreeItem } from './hooks/useTreeItem';
import { PreviewProps, PreviewMediaDimensions } from 'sanity';

type ItemPreviewProps = Omit<PreviewProps, 'media'> & {
    media?: React.ComponentType<{ dimensions: PreviewMediaDimensions; layout: string }>;
    title?: string;
};

export function ItemPreview(props: PreviewProps) {
    const { title, media: Media } = props as ItemPreviewProps;
    const { setIsEditing } = useTreeItem();

    return (
        <>
        <code>itemPreview.tsx</code>
         
        <Button
            mode="bleed"
            width="fill"
            height={34}
            paddingY={0}
            paddingX={2}
            onClick={() => setIsEditing(true)}
            textAlign='left'
            style={{ width: '100%', height: '33px' }}
        >
            <Flex gap={3} align="center" style={{ width: '100%' }}>
                {Media && <Media dimensions={{ width: 32, height: 32 }} layout='default' />}
                <Text size={1} weight="medium" style={{ color: title ? undefined : 'var(--card-muted-fg-color)' }}>
                    {title || 'Untitled'}
                </Text>
            </Flex>
        </Button></>
    );
}
