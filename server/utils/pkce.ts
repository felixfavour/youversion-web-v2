/**
 * server/utils/pkce.ts
 *
 * PKCE (Proof Key for Code Exchange) helpers for the YouVersion OAuth flow.
 * Generates a cryptographically secure code_verifier and derives the
 * SHA-256 code_challenge from it.
 */

import { randomBytes, createHash } from 'node:crypto'

/**
 * Generate a cryptographically random code_verifier (43–128 chars, URL-safe).
 */
export function generateCodeVerifier(length: number = 64): string {
  return randomBytes(length)
    .toString('base64url')
    .slice(0, length)
}

/**
 * Derive the S256 code_challenge from a code_verifier.
 * Base64-URL encode the SHA-256 digest (no padding).
 */
export function deriveCodeChallenge(verifier: string): string {
  return createHash('sha256')
    .update(verifier)
    .digest('base64url')
}

/**
 * Generate a cryptographically random string for state / nonce parameters.
 */
export function generateRandomString(length: number = 32): string {
  return randomBytes(length).toString('base64url').slice(0, length)
}
