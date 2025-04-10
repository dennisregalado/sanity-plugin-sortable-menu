import { defineArrayMember, defineType, ArrayOptions } from "sanity";
import { MenuInput } from "../input";

export const menu = defineType({
    name: 'menu',
    type: 'array',
    options: {
        depth: 2,
    },
    components: { input: MenuInput as any },
    of: [
        defineArrayMember({ type: 'menuItem' })
    ],
})