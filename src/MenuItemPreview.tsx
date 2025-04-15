import React from 'react';
import { Text, Flex } from '@sanity/ui';
import { PreviewProps, PreviewMediaDimensions } from 'sanity';

type ItemPreviewProps = Omit<PreviewProps, 'media'> & {
    media?: React.ComponentType<{ dimensions: PreviewMediaDimensions; layout: string }>;
    title?: string;
};

export function MenuItemPreview(props: PreviewProps) {
    const { title, media: Media } = props as ItemPreviewProps;

    return <Flex gap={3} align="center" style={{ width: '100%' }}>
        {Media && <Media dimensions={{ width: 32, height: 32 }} layout='default' />}
        <Text size={1} weight="medium" style={{ color: title ? undefined : 'var(--card-muted-fg-color)' }}>
            {title || 'Untitled'}
        </Text>
    </Flex>
}