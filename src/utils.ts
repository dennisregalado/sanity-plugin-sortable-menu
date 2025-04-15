// @ts-nocheck
import { UniqueIdentifier } from '@dnd-kit/abstract';

import type { Item, FlattenedItem } from './types.ts';

export function flattenTree(
  items: Item[],
  parentId: string | null = null,
  depth = 0
): FlattenedItem[] {
  if (!items) return [];
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flattenTree(item.children, item._key, depth + 1),
    ];
  }, []);
}

export function buildTree(flattenedItems: FlattenedItem[]): Item[] {
  const root: Item = { _key: 'root', children: [] };
  const nodes: Record<string, Item> = { [root._key]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { _key, children } = item;
    const parentId = item.parentId ?? root._key;
    const parent = nodes[parentId] ?? items.find(({ _key }) => _key === parentId);

    if (!parent) continue;

    nodes[_key] = { _key, children };
    parent.children.push(item);
  }

  return root.children;
}

export function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: FlattenedItem[],
  targetKey: UniqueIdentifier,
  projectedDepth: number
) {
  const targetItemIndex = items.findIndex(({ _key }) => _key === targetKey);
  const previousItem = items[targetItemIndex - 1];
  const targetItem = items[targetItemIndex];
  const nextItem = items[targetItemIndex + 1];
  const maxDepth = getMaxDepth(targetItem, previousItem);
  const minDepth = getMinDepth(nextItem);
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem._key;
    }

    const newParent = items
      .slice(0, targetItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

function getMaxDepth(
  targetItem: FlattenedItem,
  previousItem: FlattenedItem | undefined
) {
  if (!previousItem) return 0;

  return Math.min(targetItem.depth + 1, previousItem.depth + 1);
}

function getMinDepth(nextItem: FlattenedItem) {
  return nextItem ? nextItem.depth : 0;
}