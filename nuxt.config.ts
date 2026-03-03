// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  // Nuxt 4 directory structure
  future: {
    compatibilityVersion: 4,
  },

  modules: ['@nuxt/ui'],

  // Nuxt UI theme — default to light mode for a clean look
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  // Tailwind CSS v4 — loaded via a single CSS import, no tailwind.config.ts needed
  css: ['~/assets/css/main.css'],

  // Runtime config — public values are exposed to the client,
  // private values stay server-side only.
  runtimeConfig: {
    // Server-only secrets
    // In YouVersion's flow, the app_key IS the client_id
    youversionClientId: process.env.YOUVERSION_CLIENT_ID ?? '',
    youversionApiKey: process.env.YOUVERSION_API_KEY ?? '',
    oauthCallbackUrl: process.env.OAUTH_CALLBACK_URL ?? 'http://localhost:3000/auth/callback',

    // Exposed to the browser
    public: {
      youversionApiBase: process.env.YOUVERSION_API_BASE ?? 'https://api.youversion.com',
      defaultBibleId: Number(process.env.DEFAULT_BIBLE_ID ?? 1), // KJV = 1, NIV = 111, ESV = 59
    },
  },

  // SSR enabled (required for OAuth server routes)
  ssr: true,

  // Font: Inter for a clean modern look
  app: {
    head: {
      title: 'YouVersion Web',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Your personal YouVersion Bible companion — passages, highlights, and more.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  // Vite optimisations — keep Dexie client-side only
  // @tailwindcss/vite is the official Tailwind v4 Vite integration
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
    optimizeDeps: {
      include: ['dexie'],
    },
  },

  // Nitro (server) config
  nitro: {
    preset: 'vercel', // swap to 'netlify' if deploying there
  },

  typescript: {
    strict: true,
    typeCheck: false, // run separately via `npm run typecheck`
  },
})
