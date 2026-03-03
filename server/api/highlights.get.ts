/**
 * server/api/highlights.get.ts
 *
 * Proxy endpoint: fetches the authenticated user's highlights from YouVersion.
 * The response is returned as-is to the client for local Dexie hydration.
 *
 * The YouVersion API requires BOTH bible_id AND passage_id.
 * passage_id can be a chapter (e.g. "JHN.3") to get all highlights in that chapter,
 * or a single verse (e.g. "JHN.3.16").
 *
 * GET /api/highlights?bible_id=111&passage_id=JHN.3
 *
 * Upstream: GET https://api.youversion.com/v1/highlights
 */

export interface HighlightItem {
  bible_id: number
  passage_id: string
  color: string
}

export interface HighlightsResponse {
  data: HighlightItem[]
}

export default defineEventHandler(async (event): Promise<HighlightsResponse> => {
  const session = requireSession(event)
  const query = getQuery(event)

  const bibleId = query.bible_id
  const passageId = query.passage_id

  // Both are required by the YouVersion API
  if (!bibleId || !passageId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both `bible_id` and `passage_id` query parameters are required.',
    })
  }

  const params = new URLSearchParams({
    bible_id: String(bibleId),
    passage_id: String(passageId),
  })

  const response = await youversionFetch<HighlightsResponse>(
    `/v1/highlights?${params}`,
    { token: session.accessToken },
  )

  return response
})
