export interface Reference {
  _ref: string;
  _type: 'reference';
}

export interface Item {
    _key: string;
    _type: 'menuItem';
    id: string;
    label: string;
    url: string;
    reference?: Reference;
    children: Item[];
    collapsed?: boolean;
    isEditing?: boolean;
}

export interface FlattenedItem extends Item {
    parentId: string | null;
    depth: number;
    index: number;
}