import { defineArrayMember, defineType } from "sanity";
import { MenuInput } from "../input";
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