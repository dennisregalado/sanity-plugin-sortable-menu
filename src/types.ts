export interface Reference {
  _ref: string
  _type: 'reference'
}

export interface Item {
  _type: 'menuItem'
  _key: string
  label?: string
  url?: string
  reference?: Reference
  children?: Item[]
}

export interface FlattenedItem extends Item {
  parentId: string | null
  depth: number
  index: number
}
