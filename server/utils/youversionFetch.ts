/**
 * server/utils/youversionFetch.ts
 *
 * A thin wrapper around $fetch that:
 *   1. Injects the X-YVP-App-Key header required by every YouVersion API call.
 *   2. Optionally attaches a user bearer token (LAT) for authenticated endpoints.
 *   3. Centralises the base URL so it never has to be repeated across handlers.
 */

import type { FetchOptions } from 'ofetch'

const API_BASE = 'https://api.youversion.com'

export interface YouVersionFetchOptions extends FetchOptions {
  /** LAT (Limited Access Token) from the session cookie */
  token?: string
}

/**
 * Typed helper — call any YouVersion v1 endpoint with the correct headers.
 *
 * @param path   Path relative to API_BASE, e.g. `/v1/highlights`
 * @param opts   Standard $fetch options plus an optional bearer `token`
 */
export async function youversionFetch<T = unknown>(
  path: string,
  opts: YouVersionFetchOptions = {},
): Promise<T> {
  const config = useRuntimeConfig()
  const apiKey = config.youversionApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server misconfiguration: YOUVERSION_API_KEY is not set.',
    })
  }

  const { token, headers: extraHeaders, ...rest } = opts

  const headers: Record<string, string> = {
    'X-YVP-App-Key': apiKey,
    Accept: 'application/json',
    ...(extraHeaders as Record<string, string> | undefined),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return $fetch<T>(`${API_BASE}${path}`, {
    ...rest,
    headers,
  })
}
