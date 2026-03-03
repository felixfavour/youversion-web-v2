/**
 * server/api/auth/me.get.ts
 *
 * Returns session status and user profile info.
 * Used by the client to hydrate auth state on SSR.
 *
 * GET /api/auth/me
 */

export interface MeResponse {
  authenticated: boolean
  expiresAt?: number
  user?: {
    yvpId: string
    name: string
    email: string
    profilePicture: string
  }
}

export default defineEventHandler((event): MeResponse => {
  const session = getYvpSession(event)
  if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) {
    return { authenticated: false }
  }
  return {
    authenticated: true,
    expiresAt: session.expiresAt,
    user: session.user,
  }
})
