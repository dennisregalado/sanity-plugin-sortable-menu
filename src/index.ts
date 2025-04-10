import {definePlugin} from 'sanity'
import { menu } from './schema/menu'
import { menuItem } from './schema/menuItem'

interface PluginConfig {
  /* nothing here yet */
}

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {myPlugin} from 'sanity-plugin-sortable-tree'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [myPlugin()],
 * })
 * ```
 */
export const sortableMenu = definePlugin<PluginConfig | void>((config = {}) => {
  // eslint-disable-next-line no-console
  console.log('hello from sanity-plugin-sortable-tree')
  return {
    name: 'sanity-plugin-sortable-menu',
    schema: {
      types: [menu, menuItem],
    },
  }
})
