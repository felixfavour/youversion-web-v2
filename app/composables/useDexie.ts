/**
 * app/composables/useDexie.ts
 *
 * Defines the offline-first IndexedDB schema using Dexie.js and exposes
 * typed helpers for reading and writing highlights locally.
 *
 * ⚠️  This composable must ONLY be used on the client side.
 *     It is guarded by the `dexie.client.ts` plugin.
 */

import Dexie, { type Table } from 'dexie'

// ---------------------------------------------------------------------------
// Schema types
// ---------------------------------------------------------------------------

export interface LocalHighlight {
  /** Auto-incremented local primary key */
  id?: number
  /** USFM reference, e.g. "JHN.3.16" */
  passage_id: string
  /** YouVersion Bible version ID */
  bible_id: number
  /** Hex colour without the # sign, e.g. "44aa44" */
  color: string
  /** ISO timestamp of last sync */
  synced_at: string
}

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

class HighlightsDatabase extends Dexie {
  highlights!: Table<LocalHighlight, number>

  constructor() {
    super('YouVersionWebV2')

    this.version(1).stores({
      // ++id         → auto-increment primary key
      // passage_id   → indexed for fast lookup during hybrid search
      // bible_id     → indexed to filter by version
      // color        → not indexed (low cardinality, rarely queried alone)
      highlights: '++id, passage_id, bible_id, synced_at',
    })
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

let _db: HighlightsDatabase | null = null

/**
 * Returns the singleton Dexie instance.
 * Safe to call multiple times — creates the DB only once.
 */
export function useHighlightsDb(): HighlightsDatabase {
  if (!_db) {
    _db = new HighlightsDatabase()
  }
  return _db
}

// ---------------------------------------------------------------------------
// Composable with reactive helpers
// ---------------------------------------------------------------------------

export function useDexie() {
  const db = useHighlightsDb()

  /**
   * Bulk-upsert highlights fetched from the YouVersion API.
   * Uses `bulkPut` so existing records are overwritten on sync.
   */
  async function syncHighlights(
    items: Array<{ passage_id: string; bible_id: number; color: string }>,
  ): Promise<void> {
    const now = new Date().toISOString()
    const records: LocalHighlight[] = items.map(item => ({
      passage_id: item.passage_id,
      bible_id: item.bible_id,
      color: item.color,
      synced_at: now,
    }))
    await db.highlights.bulkPut(records)
  }

  /**
   * Returns a Set of passage_ids that the user has highlighted in a
   * given Bible version — used for O(1) lookup during hybrid search.
   */
  async function getHighlightedPassages(bibleId: number): Promise<Set<string>> {
    const rows = await db.highlights
      .where('bible_id')
      .equals(bibleId)
      .toArray()
    return new Set(rows.map(r => r.passage_id))
  }

  /**
   * Get a single highlight by passage + version.
   */
  async function getHighlight(
    passageId: string,
    bibleId: number,
  ): Promise<LocalHighlight | undefined> {
    return db.highlights
      .where({ passage_id: passageId, bible_id: bibleId })
      .first()
  }

  /**
   * Paginated list of all local highlights, newest-synced first.
   */
  async function listHighlights(page: number = 1, pageSize: number = 20): Promise<{
    items: LocalHighlight[]
    total: number
  }> {
    const total = await db.highlights.count()
    const items = await db.highlights
      .orderBy('synced_at')
      .reverse()
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()
    return { items, total }
  }

  /** Wipe all locally cached highlights (e.g. on logout). */
  async function clearHighlights(): Promise<void> {
    await db.highlights.clear()
  }

  return {
    db,
    syncHighlights,
    getHighlightedPassages,
    getHighlight,
    listHighlights,
    clearHighlights,
  }
}
