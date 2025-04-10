import {definePlugin} from 'sanity'
import { menu } from './schema/menu'
import { menuItem } from './schema/menuItem'

interface PluginConfig {
  /* nothing here yet */
}

export const sortableMenu = definePlugin<PluginConfig | void>((config = {}) => {
  // eslint-disable-next-line no-console
  return {
    name: 'sanity-plugin-sortable-menu',
    schema: {
      types: [menu, menuItem],
    },
  }
})
