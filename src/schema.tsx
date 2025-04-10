import { type ArrayDefinition, defineArrayMember, defineField, defineType } from 'sanity'

/**
 * @public
 */
const schemaName = 'menu' as const

/**
 * @public
 */
export interface PtStringDefinition
    extends Omit<ArrayDefinition, 'type' | 'of' | 'options' | 'decorators'> {
    type: typeof schemaName
    options?: {
        sortable?: boolean
    }
}

declare module '@sanity/types' {
    // makes type: 'ptString' narrow correctly when using defineType/defineField/defineArrayMember
    export interface IntrinsicDefinitions {
        ptString: PtStringDefinition
    }
}

/**
 * @public
 */
export const menuType = defineType({
    type: 'array',
    name: schemaName,
    //   components: { input: InputComponent as any },
    of: [
        defineArrayMember({ type: 'menuItem' })
    ],
})


export const menuItemType = defineType({
    name: 'menuItem',
    title: 'Menu Item',
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
            weak: true,
            to: [{ type: 'shopAll' }, { type: 'product' }, { type: 'collection' }, { type: 'page' }, { type: 'bundles' }],
        }),
        defineField({
            name: 'url',
            title: 'URL',
            type: 'url',
            validation: (Rule) => Rule.uri({
                allowRelative: true,
                scheme: ['https', 'http', 'mailto', 'tel'],
            }),
        }),
        defineField({
            title: 'Parameters',
            name: 'parameters',
            type: 'string',
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
            hidden: true,
            name: 'children',
            title: 'Menu items',
            type: 'array',
            of: [defineArrayMember({ type: 'menuItem' })]
        })
    ],
    preview: {
        select: {
            label: 'label',
            link: 'link',
        },
        prepare({ label, link }) {
            return {
                title: label,
                subtitle: link,
            };
        },
    },
});
