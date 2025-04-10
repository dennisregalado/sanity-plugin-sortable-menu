import { defineArrayMember, defineType } from "sanity";
import { MenuInput } from "../input";

export const menu = defineType({
    name: 'menu',
    type: 'array',
    components: { input: MenuInput },
    of: [
        defineArrayMember({ type: 'menuItem' })
    ],
})