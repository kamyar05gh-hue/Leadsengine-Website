# Leads Engine

Two deployable apps in one repo:

- **`frontend/`** — single-page marketing website for **Leads Engine**, the
  Swiss AI Buyer Visibility platform by Future Media (Bern & Zürich). Vite +
  React 19 + TypeScript (strict) + Tailwind. German primary, English
  secondary. Dark navy / electric blue / violet design with an animated SVG
  engine in the hero, PostHog analytics.
- **`dashboard/`** — private live analytics dashboard (Overview, Traffic,
  Engagement, Conversions, Performance, Audience) reading PostHog via HogQL,
  with deterministic mock fallback when the API is unreachable.

## Setup

Requires Node 20+.

```bash
cd frontend  && npm install
cd ../dashboard && npm install
```

## Development

```bash
cd frontend  && npm run dev   # marketing site  → http://localhost:5173
cd dashboard && npm run dev   # dashboard       → http://localhost:5173/dashboard/
```

## Build & deploy

```bash
npm run build:all   # at repo root: builds both apps (tsc --noEmit + vite build),
                    # then copies dashboard/dist → frontend/build/dashboard
```

Deploy the **`frontend/build`** directory to the static host. The dashboard is
served under `/dashboard/` (already `Disallow`ed in `robots.txt`).

Host configuration checklist:

- **SPA rewrite**: serve `index.html` for unknown paths under `/` and
  `/dashboard/index.html` under `/dashboard/`.
- **Cache**: `Cache-Control: public, max-age=31536000, immutable` for
  `assets/*` (hashed filenames); `no-cache` for both `index.html` files.
- **Protect the dashboard**: Basic Auth on `/dashboard/`, plus the header
  `X-Robots-Tag: noindex, nofollow` (the page also ships a `noindex` meta tag).
- **Security headers** (site-wide):
  - `Content-Security-Policy: default-src 'self'; script-src 'self' https://eu.i.posthog.com https://eu-assets.i.posthog.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://eu.i.posthog.com https://eu.posthog.com; frame-ancestors 'none'`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

After deploying, verify: `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`,
`/dashboard/` (behind auth), and that one real CTA click shows up on the
dashboard's Conversions page within ~1 minute.

## Assets still to supply

| Asset | Where | Until then |
|---|---|---|
| Reference logos (SVG, monochrome) | `frontend/public/logos/` — see its README | Brand names render as text wordmarks |
| Team photo for Mohie | `frontend/public/images/team-mohie.jpg` | Initials avatar |
| Social preview image, 1200×630 | `frontend/public/og-image.jpg` | No image in link previews |

## Environment variables

All env files are gitignored; only `.env.example` files are committed.

**`frontend/.env.example`** — optional; the deferred PostHog snippet in
`index.html` already carries the public project key (safe to expose).

**`dashboard/.env`** (required for live data — never commit):

| Variable | Meaning |
|---|---|
| `VITE_POSTHOG_HOST` | PostHog API host (default `https://eu.posthog.com`) |
| `VITE_POSTHOG_PROJECT_ID` | Numeric project id |
| `VITE_POSTHOG_PERSONAL_KEY` | Personal API key (`phx_…`) |
| `VITE_POSTHOG_SITE_HOST` | Hostname to report on (default `leadsengine.ch`) |

**Security note**: the personal API key ships inside the dashboard bundle.
That is acceptable **only** because the dashboard lives behind Basic Auth and
is noindexed — documented accepted risk. If the host supports serverless
functions, move the key into a small `/api/posthog-query` proxy and drop it
from the client entirely (preferred).

Without the key the dashboard still renders fully, using seeded mock data and
showing a visible "reference data" notice on every page.

## Conversion tracking

Goals are attributed by stable marker classes via PostHog autocapture:

- `pm-cta pm-cta-btn` — every solid "Kostenlose KI-Analyse starten" button
- `pm-cta` (without `-btn`) — the outlined CTA in the header

The dashboard's Conversions page splits these into two goals; keep the
classes stable across copy/style changes.

## Project docs

- `memory/PRD.md` — what the product is and the story the page tells.
- `memory/DECISIONS.md` — every assumption and every conflict between the
  inputs, with how it was resolved.
- `MASTER_PROMPT.md` — the original business-agnostic build spec.
