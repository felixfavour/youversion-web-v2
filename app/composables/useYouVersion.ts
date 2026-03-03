/**
 * app/composables/useYouVersion.ts
 *
 * Client-side wrappers around the Nuxt API proxy endpoints.
 * All network calls go through `/api/*` (Nitro) which inject the API key
 * server-side — the raw YouVersion key is never sent to the browser.
 */

import type { MeResponse } from '~/server/api/auth/me.get'
import type { HighlightItem, HighlightsResponse } from '~/server/api/highlights.get'

// ---------------------------------------------------------------------------
// Auth state
// ---------------------------------------------------------------------------

export interface AuthUser {
  yvpId: string
  name: string
  email: string
  profilePicture: string
}

export function useAuth() {
  const isAuthenticated = useState<boolean>('auth:authenticated', () => false)
  const sessionExpiresAt = useState<number | null>('auth:expiresAt', () => null)
  const user = useState<AuthUser | null>('auth:user', () => null)

  /** Fetch /api/auth/me and update local auth state. */
  async function checkAuth(): Promise<boolean> {
    try {
      const me = await $fetch<MeResponse>('/api/auth/me')
      isAuthenticated.value = me.authenticated
      sessionExpiresAt.value = me.expiresAt ?? null
      user.value = me.user ?? null
      return me.authenticated
    }
    catch {
      isAuthenticated.value = false
      user.value = null
      return false
    }
  }

  function login(): void {
    navigateTo('/auth/login', { external: true })
  }

  async function logout(): Promise<void> {
    await $fetch('/auth/logout', { method: 'POST' })
    isAuthenticated.value = false
    sessionExpiresAt.value = null
    user.value = null
    navigateTo('/')
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    sessionExpiresAt: readonly(sessionExpiresAt),
    user: readonly(user),
    checkAuth,
    login,
    logout,
  }
}

// ---------------------------------------------------------------------------
// Bibles
// ---------------------------------------------------------------------------

export interface BibleVersion {
  id: number
  abbreviation: string
  title: string
  localized_title: string
  localized_abbreviation: string
  language_tag: string
}

export function useBibles() {
  const bibles = ref<BibleVersion[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBibles(languageRanges: string[] = ['en']): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      languageRanges.forEach((lr) => params.append('language_ranges[]', lr))
      params.set('page_size', '50')

      const res = await $fetch<{ data: BibleVersion[] }>('/api/bibles', {
        params: { 'language_ranges[]': languageRanges, page_size: 50 },
      })
      bibles.value = res.data ?? []
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load Bible versions.'
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    bibles: readonly(bibles),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchBibles,
  }
}

// ---------------------------------------------------------------------------
// Passage Lookup
// ---------------------------------------------------------------------------

export interface PassageResult {
  id: string
  content: string
  reference: string
}

export function usePassageLookup() {
  const passage = ref<PassageResult | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function lookupPassage(bibleId: number, passageId: string, format: string = 'text'): Promise<void> {
    isLoading.value = true
    error.value = null
    passage.value = null
    try {
      const res = await $fetch<PassageResult>('/api/search', {
        query: { bible_id: bibleId, passage_id: passageId, format },
      })
      passage.value = res
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load passage.'
    }
    finally {
      isLoading.value = false
    }
  }

  function reset(): void {
    passage.value = null
    error.value = null
  }

  return {
    passage: readonly(passage),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lookupPassage,
    reset,
  }
}

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

export function useHighlightsApi() {
  /**
   * Fetch highlights for a given Bible version and passage.
   * Both bible_id and passage_id are REQUIRED by the YouVersion API.
   */
  async function fetchHighlights(params: {
    bibleId: number
    passageId: string
  }): Promise<HighlightItem[]> {
    const res = await $fetch<HighlightsResponse>('/api/highlights', {
      query: { bible_id: params.bibleId, passage_id: params.passageId },
    })
    return res.data ?? []
  }

  return { fetchHighlights }
}

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

export interface BibleBook {
  id: string
  title: string
  full_title: string
  abbreviation: string
  canon: string
  chapters: Array<{
    id: number
    passage_id: string
    title: number
  }>
}

export function useBooks() {
  const books = ref<BibleBook[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBooks(bibleId: number): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ data: BibleBook[] }>('/api/books', {
        query: { bible_id: bibleId },
      })
      books.value = res.data ?? []
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load books.'
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    books: readonly(books),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchBooks,
  }
}
