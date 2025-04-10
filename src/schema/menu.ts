import { defineArrayMember, defineType } from "sanity";
import { MenuInput } from "../input";

export const menu = defineType({
    name: 'menu',
    type: 'array',
    components: { input: MenuInput as any },
    of: [
        defineArrayMember({ type: 'menuItem' })
    ],
})