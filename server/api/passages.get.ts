/**
 * server/api/passages.get.ts
 *
 * Proxy endpoint: fetches Bible passage text from the YouVersion API.
 * Does NOT require user authentication — only the API key.
 *
 * GET /api/passages?bible_id=3034&passage_id=JHN.3.16&format=text
 *
 * Upstream: GET https://api.youversion.com/v1/bibles/{bible_id}/passages/{passage_id}
 */

interface PassageResponse {
  id: string
  content: string
  reference: string
}

export default defineEventHandler(async (event): Promise<PassageResponse> => {
  const query = getQuery(event)

  const bibleId = query.bible_id
  const passageId = query.passage_id
  const format = query.format || 'text'

  if (!bibleId || !passageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both `bible_id` and `passage_id` query parameters are required.',
    })
  }

  const params = new URLSearchParams({ format: String(format) })

  const response = await youversionFetch<PassageResponse>(
    `/v1/bibles/${bibleId}/passages/${passageId}?${params}`,
  )

  return response
})
