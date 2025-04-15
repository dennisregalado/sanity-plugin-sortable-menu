import { defineArrayMember, defineType } from "sanity";
import { SortableTreeInput } from "../refactor/TreeInput"; 

export const menu = defineType({
    name: 'menu',
    type: 'array',
    components: { 
        input: SortableTreeInput
    },
    of: [
        defineArrayMember({ type: 'menuItem' }),
        defineArrayMember({ type: 'image' })
    ],
})