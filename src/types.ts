export interface Reference {
  _ref: string;
  _type: 'reference';
}

export interface Item {
  _type: 'menuItem';
  _key: string;
  id: string;
  label?: string;
  url?: string;
  reference?: Reference;
  children?: Item[];
  collapsed?: boolean;
  isEditing?: boolean;
}

export interface FlattenedItem extends Item {
  parentId: string | null;
  depth: number;
  index: number;
}