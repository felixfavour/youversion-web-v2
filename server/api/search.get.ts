/**
 * server/api/search.get.ts
 *
 * Proxy endpoint: fetches a Bible passage by reference from the YouVersion API.
 * Since YouVersion doesn't have a full-text search endpoint, this acts as a
 * passage lookup by USFM reference (e.g. "JHN.3.16", "GEN.1", "PSA.23").
 *
 * GET /api/search?bible_id=111&passage_id=JHN.3.16
 *
 * Upstream: GET https://api.youversion.com/v1/bibles/{bible_id}/passages/{passage_id}
 */

export interface PassageResult {
  id: string
  content: string
  reference: string
}

export default defineEventHandler(async (event): Promise<PassageResult> => {
  const query = getQuery(event)

  const bibleId = query.bible_id || query.bibleId
  const passageId = query.passage_id || query.passageId

  if (!bibleId || !passageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both `bible_id` and `passage_id` are required.',
    })
  }

  const format = query.format || 'text'
  const params = new URLSearchParams({ format: String(format) })

  const response = await youversionFetch<PassageResult>(
    `/v1/bibles/${bibleId}/passages/${passageId}?${params}`,
  )

  return response
})
