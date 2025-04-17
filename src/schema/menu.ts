import { defineArrayMember, defineType } from 'sanity'
import { SortableTreeInput } from '../SortableTreeInput'

export const menu = defineType({
  name: 'menu',
  type: 'array',
  components: {
    input: SortableTreeInput,
  },
  options: {
    depth: 1
  } as any,
  of: [defineArrayMember({ type: 'menuItem' })],
})
