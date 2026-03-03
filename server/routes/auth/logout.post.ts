/**
 * server/routes/auth/logout.post.ts
 *
 * Clear the session cookie and redirect to the home page.
 *
 * POST /auth/logout
 */

export default defineEventHandler((event) => {
  clearYvpSession(event)
  return sendRedirect(event, '/', 302)
})
