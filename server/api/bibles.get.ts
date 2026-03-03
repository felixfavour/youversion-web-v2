/**
 * server/api/bibles.get.ts
 *
 * Proxy endpoint: fetches available Bible versions from the YouVersion API.
 * Does NOT require user authentication — only the API key.
 *
 * GET /api/bibles?language_ranges[]=en
 *
 * Upstream: GET https://api.youversion.com/v1/bibles
 */

interface BibleItem {
  id: number
  abbreviation: string
  title: string
  localized_title: string
  localized_abbreviation: string
  language_tag: string
}

interface BiblesResponse {
  data: BibleItem[]
  next_page_token?: string
  total_size?: number
}

export default defineEventHandler(async (event): Promise<BiblesResponse> => {
  const query = getQuery(event)

  const params = new URLSearchParams()

  // language_ranges[] is required by the API
  const langRanges = query['language_ranges[]'] || query.language_ranges || 'en'
  if (Array.isArray(langRanges)) {
    langRanges.forEach((lr) => params.append('language_ranges[]', String(lr)))
  } else {
    params.append('language_ranges[]', String(langRanges))
  }

  if (query.page_size) params.set('page_size', String(query.page_size))
  if (query.page_token) params.set('page_token', String(query.page_token))

  const response = await youversionFetch<BiblesResponse>(
    `/v1/bibles?${params}`,
  )

  return response
})
