/**
 * server/routes/auth/callback.get.ts
 *
 * YouVersion OAuth PKCE callback handler.
 *
 * The callback URL is hit TWICE during the flow:
 *
 *   Hit 1 — After the user signs in at login.youversion.com:
 *     Query: ?yvp_id=...&user_name=...&user_email=...&profile_picture=...&state=...
 *     Action: Validate state, stash user info in a cookie, then redirect the
 *             browser to YouVersion's /auth/callback to get the auth code.
 *
 *   Hit 2 — After YouVersion's /auth/callback issues the code:
 *     Query: ?code=...&state=...&scope=...
 *     Action: Validate state, exchange code + code_verifier at /auth/token
 *             for JWT tokens, persist session, redirect to /highlights.
 *
 * GET /auth/callback
 */

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: string | number
  refresh_token: string
  id_token: string
  scope: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const pkce = getPkceCookies(event)

  // ── HIT 2: we have a `code` — exchange it for tokens ────────────────────
  if (query.code) {
    const code = query.code as string
    const returnedState = query.state as string | undefined

    // Validate CSRF state
    if (!pkce.state || returnedState !== pkce.state) {
      clearPkceCookies(event)
      throw createError({ statusCode: 403, statusMessage: 'Invalid state — possible CSRF attack.' })
    }

    if (!pkce.codeVerifier) {
      clearPkceCookies(event)
      throw createError({ statusCode: 400, statusMessage: 'Missing PKCE code_verifier.' })
    }

    // Read the stashed user info from the ephemeral cookie
    const userInfoRaw = getCookie(event, 'yvp_user_info')
    let userInfo = { yvpId: '', name: '', email: '', profilePicture: '' }
    if (userInfoRaw) {
      try {
        userInfo = JSON.parse(Buffer.from(userInfoRaw, 'base64').toString('utf-8'))
      }
      catch { /* use defaults */ }
    }
    deleteCookie(event, 'yvp_user_info')

    // Exchange code for tokens (server-to-server POST)
    const tokenResponse = await $fetch<TokenResponse>('https://api.youversion.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.oauthCallbackUrl,
        client_id: config.youversionClientId,
        code_verifier: pkce.codeVerifier,
      }).toString(),
    }).catch((err) => {
      console.error('[auth/callback] Token exchange failed:', err?.data ?? err)
      clearPkceCookies(event)
      throw createError({ statusCode: 502, statusMessage: 'Token exchange with YouVersion failed.' })
    })

    const expiresIn = typeof tokenResponse.expires_in === 'string'
      ? parseInt(tokenResponse.expires_in, 10)
      : tokenResponse.expires_in

    // Persist session
    setYvpSession(event, {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      idToken: tokenResponse.id_token,
      tokenType: tokenResponse.token_type,
      expiresAt: Math.floor(Date.now() / 1000) + (expiresIn || 3599),
      user: userInfo,
    })

    clearPkceCookies(event)
    return sendRedirect(event, '/highlights', 302)
  }

  // ── HIT 1: user info redirect — no `code` yet ───────────────────────────
  const yvpId = query.yvp_id as string | undefined
  const userName = query.user_name as string | undefined
  const userEmail = query.user_email as string | undefined
  const profilePicture = query.profile_picture as string | undefined
  const returnedState = query.state as string | undefined

  if (!yvpId || !returnedState) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required callback parameters.' })
  }

  // Validate CSRF state
  if (!pkce.state || returnedState !== pkce.state) {
    clearPkceCookies(event)
    throw createError({ statusCode: 403, statusMessage: 'Invalid state — possible CSRF attack.' })
  }

  // Stash user info in a short-lived httpOnly cookie so we can read it in Hit 2
  const userInfoEncoded = Buffer.from(JSON.stringify({
    yvpId,
    name: userName ?? '',
    email: userEmail ?? '',
    profilePicture: profilePicture ?? '',
  })).toString('base64')

  setCookie(event, 'yvp_user_info', userInfoEncoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  // Redirect browser to YouVersion's /auth/callback to mint the code
  const callbackParams = new URLSearchParams({
    state: returnedState,
    yvp_id: yvpId,
    ...(userName && { user_name: userName }),
    ...(userEmail && { user_email: userEmail }),
    ...(profilePicture && { profile_picture: profilePicture }),
  })

  const yvCallbackUrl = `https://api.youversion.com/auth/callback?${callbackParams.toString()}`

  return sendRedirect(event, yvCallbackUrl, 302)
})
