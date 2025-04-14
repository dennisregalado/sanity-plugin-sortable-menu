import { defineArrayMember, defineType } from "sanity";
import { TreeInput } from "../refactor/TreeInput"; 

export const menu = defineType({
    name: 'menu',
    type: 'array',
    components: { 
        input: TreeInput
    },
    of: [
        defineArrayMember({ type: 'menuItem' })
    ],
})