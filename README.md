# YouVersion Web v2

A personal Bible companion web app built with **Nuxt 4**, **Nuxt UI v3**, and **Dexie.js** — replacing the YouVersion Search Filter browser extension.

## Features

- 🔐 **YouVersion OAuth 2.0** — server-side sign-in via Nitro routes
- 📖 **Hybrid Bible Search** — queries the YouVersion API then cross-references local highlights
- 💾 **Offline-First Highlights** — stored in IndexedDB (Dexie.js), synced on login
- 🎨 **Nuxt UI v3** — Tailwind-powered component library

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 |
| UI | Nuxt UI v3 (Tailwind CSS) |
| Offline DB | Dexie.js (IndexedDB) |
| API | YouVersion Platform API |
| Auth | YouVersion OAuth 2.0 (LAT) |
| Deploy | Vercel / Netlify (SSR) |

## Project Structure

```
youversion-web-v2/
├── app/
│   ├── components/
│   │   ├── HighlightCard.vue        # Single highlight display card
│   │   └── SearchResultItem.vue     # Search result row with highlight badge
│   ├── composables/
│   │   ├── useDexie.ts              # Dexie DB schema + helpers
│   │   └── useYouVersion.ts         # YouVersion API call wrappers
│   ├── layouts/
│   │   └── default.vue              # App shell with nav
│   ├── middleware/
│   │   └── auth.ts                  # Route guard (redirect if not logged in)
│   ├── pages/
│   │   ├── index.vue                # Landing / dashboard
│   │   ├── search.vue               # Hybrid search page
│   │   └── highlights.vue           # Paginated highlights list
│   └── plugins/
│       └── dexie.client.ts          # Client-only Dexie initialisation
├── server/
│   ├── api/
│   │   ├── highlights.get.ts        # Proxy: GET /api/highlights
│   │   └── search.get.ts            # Proxy: GET /api/search
│   ├── routes/
│   │   └── auth/
│   │       ├── login.get.ts         # Redirect to YouVersion OAuth
│   │       ├── callback.get.ts      # Exchange code for token, set cookie
│   │       └── logout.post.ts       # Clear session cookie
│   └── utils/
│       └── youversionFetch.ts       # $fetch wrapper with X-YVP-App-Key
├── public/
│   └── favicon.svg
├── .env.example
├── nuxt.config.ts
└── package.json
```

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd youversion-web-v2
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in your credentials from the [YouVersion Platform Portal](https://platform.youversion.com/):

| Variable | Description |
|----------|-------------|
| `YOUVERSION_CLIENT_ID` | OAuth application client ID |
| `YOUVERSION_CLIENT_SECRET` | OAuth application client secret |
| `YOUVERSION_API_KEY` | `X-YVP-App-Key` header value |
| `OAUTH_CALLBACK_URL` | Full callback URL (e.g. `http://localhost:3000/auth/callback`) |
| `DEFAULT_BIBLE_ID` | Default Bible version ID (e.g. `111` for NIV) |

### 3. Run development server

```bash
npm run dev
```

### 4. Deploy

**Vercel** (default):
```bash
vercel deploy
```

**Netlify** — change `nitro.preset` in `nuxt.config.ts` to `'netlify'`, then:
```bash
netlify deploy --build
```

## OAuth Flow

```
Browser → GET /auth/login
  → Redirect to https://api.youversion.com/oauth/authorize?...
  → User logs in at YouVersion
  → YouVersion redirects to /auth/callback?code=...
  → Server exchanges code for access_token (LAT)
  → Token stored in httpOnly cookie
  → Browser redirected to /highlights
```

## API Proxy Endpoints

| Endpoint | YouVersion Upstream | Auth Required |
|----------|--------------------|----|
| `GET /api/highlights` | `GET /v1/highlights` | ✅ |
| `GET /api/search` | `GET /v1/search/verse` | ✅ |

## License

MIT
