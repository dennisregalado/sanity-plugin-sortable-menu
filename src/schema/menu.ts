import {defineArrayMember, defineType} from 'sanity'
import {SortableTreeInput} from '../SortableTreeInput'

export const menu = defineType({
  name: 'menu',
  type: 'array',
  components: {
    input: SortableTreeInput,
  },
  of: [defineArrayMember({type: 'menuItem'}), defineArrayMember({type: 'image'})],
})
