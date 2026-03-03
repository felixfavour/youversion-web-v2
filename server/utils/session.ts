/**
 * server/utils/session.ts
 *
 * Helpers for reading and writing the httpOnly session cookie that stores
 * the user's YouVersion access token (JWT) and basic profile info.
 *
 * Also manages ephemeral PKCE cookies (code_verifier, state, nonce) used
 * during the OAuth flow.
 */

import type { H3Event } from 'h3'

// ---------------------------------------------------------------------------
// Session cookie (persistent, holds auth tokens + user info)
// ---------------------------------------------------------------------------

export const SESSION_COOKIE = 'yvp_session'

export interface UserInfo {
  yvpId: string
  name: string
  email: string
  profilePicture: string
}

export interface SessionData {
  accessToken: string
  refreshToken: string
  idToken: string
  tokenType: string
  /** Unix epoch seconds */
  expiresAt: number
  user: UserInfo
}

/** Read the session from the httpOnly cookie. Returns null if absent/corrupt. */
export function getYvpSession(event: H3Event): SessionData | null {
  try {
    const raw = getCookie(event, SESSION_COOKIE)
    if (!raw) return null
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')) as SessionData
  }
  catch {
    return null
  }
}

/** Persist the session as a secure, httpOnly cookie. */
export function setYvpSession(event: H3Event, data: SessionData): void {
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64')
  setCookie(event, SESSION_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: data.expiresAt - Math.floor(Date.now() / 1000),
  })
}

/** Delete the session cookie. */
export function clearYvpSession(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE)
}

/** Throw a 401 if the session is missing or expired. */
export function requireSession(event: H3Event): SessionData {
  const session = getYvpSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorised — please sign in.' })
  }
  if (session.expiresAt < Math.floor(Date.now() / 1000)) {
    clearYvpSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Session expired — please sign in again.' })
  }
  return session
}

// ---------------------------------------------------------------------------
// Ephemeral PKCE cookies (short-lived, used only during the OAuth dance)
// ---------------------------------------------------------------------------

const PKCE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 600, // 10 minutes — plenty for the OAuth round-trip
}

export function setPkceCookies(
  event: H3Event,
  data: { codeVerifier: string; state: string; nonce: string },
): void {
  setCookie(event, 'yvp_pkce_verifier', data.codeVerifier, PKCE_COOKIE_OPTIONS)
  setCookie(event, 'yvp_pkce_state', data.state, PKCE_COOKIE_OPTIONS)
  setCookie(event, 'yvp_pkce_nonce', data.nonce, PKCE_COOKIE_OPTIONS)
}

export function getPkceCookies(event: H3Event): {
  codeVerifier: string | undefined
  state: string | undefined
  nonce: string | undefined
} {
  return {
    codeVerifier: getCookie(event, 'yvp_pkce_verifier'),
    state: getCookie(event, 'yvp_pkce_state'),
    nonce: getCookie(event, 'yvp_pkce_nonce'),
  }
}

export function clearPkceCookies(event: H3Event): void {
  deleteCookie(event, 'yvp_pkce_verifier')
  deleteCookie(event, 'yvp_pkce_state')
  deleteCookie(event, 'yvp_pkce_nonce')
}
