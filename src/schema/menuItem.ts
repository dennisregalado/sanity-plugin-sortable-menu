import { defineArrayMember, defineField, defineType } from "sanity";
import { BlockElementIcon, } from '@sanity/icons';
import { ItemInput } from "../itemInput";
import { Item } from "../item";
import { ItemPreview } from "../itemPreview";
export const menuItem = defineType({
    name: 'menuItem',
    title: 'Menu Item',
    components: {
        input: ItemInput,
        item: Item,
        preview: ItemPreview,
    },
    type: 'object',
    fieldsets: [{ name: 'advanced', title: 'Advanced' }],
    fields: [
        defineField({
            name: 'label',
            title: 'Label',
            validation: (Rule) => Rule.required().error('Enter a label name'),
            type: 'string',
        }),
        defineField({
            name: 'reference',
            title: 'Reference',
            type: 'reference',
            hidden: true,
            weak: true,
            to: [{ type: 'shopAll' }, { type: 'product' }, { type: 'collection' }, { type: 'page' }, { type: 'bundles' }],
        }),
        defineField({
            name: 'url',
            title: 'Link',
            type: 'url',
            validation: (Rule) => Rule.uri({
                allowRelative: true,
                scheme: ['https', 'http', 'mailto', 'tel'],
            }).error('Enter a valid URL or choose a page'),
        }),
        defineField({
            title: 'Parameters',
            name: 'parameters',
            type: 'string',
            hidden: true,
            description: 'Add custom parameters to the URL, such as UTM tags',
            validation: (rule) =>
                rule.custom((value) => {
                    if (!value) {
                        return true
                    }

                    if (value.indexOf('?') !== 0) {
                        return 'Must start with ?; eg. ?utm_source=example.com&utm_medium=referral'
                    }

                    if (value.length === 1) {
                        return 'Must contain at least one parameter'
                    }

                    return true
                }),
            fieldset: 'advanced',
        }),
        defineField({
            //    hidden: true,
            type: 'array',
            name: 'children',
            title: 'Menu items',
            of: [defineArrayMember({ type: 'menuItem' })]
        }),
        defineField({
            name: 'isEditing',
            title: 'Is Editing',
            type: 'boolean',
            hidden: true,
            description: 'Whether the menu item is being edited',
        }),
        defineField({
            name: 'parentId',
            title: 'Parent ID',
            type: 'string',
            hidden: true,
            description: 'The parent ID of the menu item',
        }),
        defineField({
            name: 'index',
            title: 'Index',
            type: 'number',
            hidden: true,
            description: 'The index of the menu item',
        }),
        defineField({
            name: 'id',
            title: 'ID',
            type: 'string',
            hidden: true,
            description: 'The ID of the menu item',
        }),
        defineField({
            name: 'depth',
            title: 'Depth',
            type: 'number',
            hidden: true,
            description: 'The depth of the menu item',
        })
    ],
    preview: {
        select: {
            title: 'label',
            url: 'url',
            media: 'reference.image',
        },
        prepare({ title, media }) {
            return {
                title,
                media: media || BlockElementIcon
            };
        },
    },
});