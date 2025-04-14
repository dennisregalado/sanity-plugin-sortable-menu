import { useSortable } from '@dnd-kit/react/sortable';
import { FlattenedItem } from '../types'; 

export interface Props extends FlattenedItem {
  onRemove?(): void;
  editing?: React.ReactNode;
  collapsed?: boolean;
  onCollapse?(isCollapsed: boolean): void;
}

const INDENTATION = 50;

export function TreeItem({ depth, id, index, parentId }: Props) {

  const { ref, handleRef, isDragSource, isDragging } = useSortable({
    alignment: {
      x: 'start',
      y: 'center',
    },
    transition: {
      idle: true,
    },
    id,
    index,
    data: {
      depth,
      parentId,
    },
  });

  return (
    <li
      ref={ref}
      style={{
        marginLeft: depth * INDENTATION,
        ...(isDragging && {
          zIndex: 5,
          position: 'relative',
        }),
      }}
      aria-hidden={isDragSource}
    > 
    </li>
  );
} 