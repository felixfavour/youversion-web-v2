/**
 * server/routes/auth/login.get.ts
 *
 * Step 1 of the YouVersion OAuth PKCE flow.
 *
 * 1. Generates code_verifier, state, nonce.
 * 2. Stores them in short-lived httpOnly cookies.
 * 3. Redirects browser to https://api.youversion.com/auth/authorize
 *
 * GET /auth/login
 */

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier(64)
  const codeChallenge = deriveCodeChallenge(codeVerifier)
  const state = generateRandomString(32)
  const nonce = generateRandomString(32)

  // Persist in short-lived httpOnly cookies for the callback to read
  setPkceCookies(event, { codeVerifier, state, nonce })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.youversionClientId,
    redirect_uri: config.oauthCallbackUrl,
    scope: 'openid profile email',
    nonce,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  const authoriseUrl = `https://api.youversion.com/auth/authorize?${params.toString()}`

  return sendRedirect(event, authoriseUrl, 302)
})
