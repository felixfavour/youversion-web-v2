/**
 * app/plugins/dexie.client.ts
 *
 * Ensures Dexie (IndexedDB) is only ever instantiated on the client.
 * The plugin makes the db instance available via `nuxtApp.$db` and also
 * triggers an initial sync if the user is already authenticated.
 */

import { useHighlightsDb } from '~/composables/useDexie'

export default defineNuxtPlugin(async () => {
  // Initialise the database (this call is idempotent)
  const db = useHighlightsDb()

  return {
    provide: {
      db,
    },
  }
})
