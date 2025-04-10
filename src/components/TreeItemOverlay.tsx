import type { UniqueIdentifier } from '@dnd-kit/abstract';
import { AddIcon } from '@sanity/icons';
import { Button } from '@sanity/ui';
import { useMemo } from 'react';
import { Item } from '../types.js';

interface Props {
    children: Item[];
}

export function TreeItemOverlay({ children }: Props) {

    const totalChildren = useMemo(() => {
        // Recursive function to count all children at all depths
        const countAllChildren = (items: Item[]): number => {
            // Start with the count of direct children
            let count = items.length;

            // For each item, recursively count its children
            items.forEach(item => {
                if (item.children && item.children.length > 0) {
                    count += countAllChildren(item.children);
                }
            });

            return count;
        };

        // If no children, return 1 (just the dragged item itself)
        if (children.length === 0) return 1;

        // Count all children recursively and add 1 for the dragged item itself
        return countAllChildren(children) + 1;
    }, [children]);

    return (
        <Button tone="suggest"
            width="fill"
            icon={AddIcon}
            padding={2}
            text={totalChildren > 1 ? `${totalChildren} items` : '1 item'}
            mode="bleed"
            justify='flex-start'
            textAlign='left'
            selected={true}
            data-overlay>
        </Button>
    );
}