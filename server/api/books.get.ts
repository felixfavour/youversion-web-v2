/**
 * server/api/books.get.ts
 *
 * Proxy endpoint: fetches the list of books for a Bible version.
 * Does NOT require user authentication — only the API key.
 *
 * GET /api/books?bible_id=3034
 *
 * Upstream: GET https://api.youversion.com/v1/bibles/{bible_id}/books
 */

interface Chapter {
  id: number
  passage_id: string
  title: number
}

interface BookItem {
  id: string
  title: string
  full_title: string
  abbreviation: string
  canon: string
  chapters: Chapter[]
}

interface BooksResponse {
  data: BookItem[]
}

export default defineEventHandler(async (event): Promise<BooksResponse> => {
  const query = getQuery(event)
  const bibleId = query.bible_id

  if (!bibleId) {
    throw createError({
      statusCode: 400,
      statusMessage: '`bible_id` query parameter is required.',
    })
  }

  const params = new URLSearchParams()
  if (query.canon) params.set('canon', String(query.canon))

  const qs = params.size ? `?${params}` : ''

  const response = await youversionFetch<BooksResponse>(
    `/v1/bibles/${bibleId}/books${qs}`,
  )

  return response
})
