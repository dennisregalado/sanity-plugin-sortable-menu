import React from 'react';
import { Button, Text, Flex } from '@sanity/ui';
import { useTreeItem } from './context/TreeItemContext';
import { PreviewProps, PreviewMediaDimensions } from 'sanity';

type ItemPreviewProps = Omit<PreviewProps, 'media'> & {
    media?: React.ComponentType<{ dimensions: PreviewMediaDimensions; layout: string }>;
};

export function ItemPreview(props: ItemPreviewProps) {
    const { title, media: Media } = props;
    const { setIsEditing } = useTreeItem();

    return (
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
            <Flex gap={3} align="center" data-testid='item-preview' className='w-full' style={{ width: '100%' }}>
                {Media && <Media dimensions={{ width: 20, height: 20 }} layout="default" />}
                <Text size={1} weight="medium" style={{ color: title ? undefined : 'var(--card-muted-fg-color)' }}>
                    {title || 'Untitled'}
                </Text>
            </Flex>
        </Button>
    );
}
