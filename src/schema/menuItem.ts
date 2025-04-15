import {defineArrayMember, defineField, defineType} from 'sanity'
import {InlineEditing, defaultMenu} from '../InlineEditing'
import {SortableTreeInput} from '../SortableTreeInput'
import {SortableTreeField} from '../SortableTreeField'

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menu Item',
  components: {
    input: InlineEditing,
  },
  type: 'object',
  fieldsets: [{name: 'advanced', title: 'Advanced'}],
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
      to: [
        {type: 'shopAll'},
        {type: 'product'},
        {type: 'collection'},
        {type: 'page'},
        {type: 'bundles'},
      ],
    }),
    defineField({
      name: 'url',
      title: 'Link',
      type: 'url',
      validation: (Rule) =>
        Rule.uri({
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
      type: 'array',
      name: 'children',
      components: {
        input: SortableTreeInput,
        field: SortableTreeField,
      },
      title: 'Children',
      of: [defineArrayMember({type: 'menuItem'}), defineArrayMember({type: 'image'})],
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
    }),
  ],
  preview: {
    select: {
      title: 'label',
      url: 'url',
      media: 'reference.image',
    },
    prepare({title, media, url}) {
      interface MenuItem {
        value?: string
        icon?: any
        children?: MenuItem[]
      }

      const findMenuItem = (items: MenuItem[]): MenuItem | null => {
        return items.reduce((acc: MenuItem | null, item: MenuItem) => {
          if (acc) return acc
          if (item.value === url) return item
          if (item.children) return findMenuItem(item.children)
          return null
        }, null)
      }

      const matchingItem = findMenuItem(defaultMenu)
      const icon = matchingItem?.icon

      return {
        title,
        media: icon || media,
      }
    },
  },
})
