/**
 * app/middleware/auth.ts
 *
 * Route middleware that redirects unauthenticated users to the home page.
 * Apply it per-page with `definePageMeta({ middleware: 'auth' })`.
 */

export default defineNuxtRouteMiddleware(async () => {
  // On the server, we check the session cookie via the API.
  // On the client, useAuth keeps a reactive boolean in useState.
  const { checkAuth } = useAuth()
  const authenticated = await checkAuth()

  if (!authenticated) {
    return navigateTo('/')
  }
})
