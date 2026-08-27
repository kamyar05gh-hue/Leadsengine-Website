# MASTER PROMPT — Production Marketing Website + Live Analytics Dashboard Template

> Copy everything below the line into a fresh AI coding session, fill in the
> `[PLACEHOLDERS]`, and the agent should produce a complete, deployable project.
> This prompt encodes the *fundamentals* of the build (architecture, subpages,
> SEO/AEO/GEO, analytics dashboard, security, performance, animation system,
> CSS system) — not its content. It is business-agnostic.
>
> This repo implements it with the Leadsengine inputs recorded in
> `memory/DECISIONS.md`.
>
> **Read §6a and §17a before writing any subpage.** They are the two sections
> written from things that actually went wrong here rather than from theory:
> §6a is why a subpage must be a real app page, and §17a is the list of silent
> failures that no build error will catch for you.

---

## 1. Role & objective

You are a senior product engineer (React + TypeScript + performance + SEO).
Build **two deployable apps in one repo**:

1. **`frontend/`** — a world-class, conversion-focused marketing website for
   `[BUSINESS NAME]`, a `[SERVICE DESCRIPTION]` for `[TARGET AUDIENCE]` in
   `[COUNTRY / MARKET]`. Primary conversion = click on the primary CTA
   (`[PRIMARY CTA LABEL]` → `[PRIMARY CTA URL]`). Secondary conversion =
   floating CTA widget.
2. **`dashboard/`** — a live analytics dashboard (single-page app) that reads
   the site's analytics from a third-party API (PostHog HogQL by default) and
   visualizes traffic, engagement, conversions, performance and audience.

The result must feel like a premium product from a top studio: fast, perfectly
aligned, smooth, multilingual, accessible, and measurable. Generate real,
complete code — no stubs, no TODO comments, no lorem ipsum.

## 2. Business inputs to fill before generating

Brand name, one-line positioning, service, audience, market & languages,
domain, primary CTA (label + URL), accent color + hover, analytics project
(PostHog id + public key + host), legal pages, social proof assets, hero media.
If any input is missing, make a sensible, professional assumption and record it
in `memory/DECISIONS.md` — never leave placeholder text in the UI.

## 3. Non-negotiable fundamentals

- **Mobile-first responsive**: design at 360px first; no horizontal scroll
  (`overflow-x: clip`), no clipped descenders, no overlap at 360/768/1024/1440.
- **Above-the-fold completeness**: first mobile viewport shows header → value
  proposition → proof → primary CTA without scrolling.
- **Performance budget**: LCP < 2.5 s, INP < 200 ms, CLS < 0.1 on 4G mobile;
  initial JS < ~200 KB gzip; below-the-fold sections code-split.
- **SEO + AEO + GEO** (see §7).
- **Accessible**: WCAG 2.2 AA; landmarks, focus-visible, contrast ≥ 4.5:1,
  keyboard-operable, `prefers-reduced-motion`.
- **Secure**: no secrets in the repo or the client bundle (see §13).
- **Multilingual by architecture**: all UI strings behind a language context;
  adding a language = adding one file.
- **Measurable**: every CTA carries a stable marker class (see §11).
- **Clean code**: TypeScript strict, small components, no dead code.

## 4. Tech stack

**Frontend**: Vite + React 19 + TypeScript strict; Tailwind 3.4+ with CSS
custom properties as tokens; `React.lazy`/`Suspense` code-splitting; CSS-first
animation (`transform`/`opacity` only), framer-motion only where CSS is
insufficient, optional lenis smooth scroll (reduced-motion aware);
lucide-react; react-hook-form + zod for forms; Google Fonts via preconnect +
`display=swap` + async stylesheet pattern. Prefer Astro/Next static export if
the host allows; a CSR build MUST ship the `<noscript>` SEO fallback.

**Dashboard**: Vite + React + TS strict + Tailwind; recharts; framer-motion
page transitions; PostHog HogQL data layer; client-side page switching; 30 s
auto-refresh; full i18n mirroring the frontend pattern.

**Tooling**: ESLint (react, react-hooks, jsx-a11y) + `tsc --noEmit` in build.

## 5. Repository layout

```
frontend/   index.html                 ← home entry
            ueber-uns/index.html       ← one HTML shell per subpage route
            impressum/index.html         (see §6a — these are Vite entries)
            datenschutz/index.html
            agb/index.html
            public/ (robots.txt, sitemap.xml, llms.txt, manifest, _headers,
                     _redirects, team/, logos/)
            src/ entries/   (one mount file per HTML entry)
                 pages/     (About.tsx, Legal.tsx — full subpage components)
                 sections/  (one per home-page section + Header/Footer)
                 components/ i18n/ hooks/ lib/ constants/
dashboard/  src/ (pages ×6, components, data/{posthog,mock}.ts, lib, i18n)
memory/     PRD.md, DECISIONS.md
scripts/    assemble.mjs, security-headers.mjs
MASTER_PROMPT.md  README.md  package.json (build:all)
```

Keep business data (lead exports, CRM CSVs) OUT of the repo and gitignored —
it is not website code and it bloats the checkout.

## 6. Frontend architecture rules

App shell wires routes; above-the-fold sections static, everything below lazy
in one Suspense boundary. One component per section. One `PrimaryCta`
component everywhere; floating widget separate. Marker classes: primary CTA →
`pm-cta pm-cta-btn`, floating widget → `pm-cta` (no `-btn`). LanguageContext
exposes typed `t` + `lang` + `setLang`, persists to localStorage, sets
`<html lang>`. No global state library. Images via a `SmoothImage` component
(lazy, async decode, explicit dimensions, srcSet). Hero video (if any): native
`<video>` with poster, `preload="metadata"`, custom accent-styled controls
with a real `<input type="range">` timeline. Every remote load has a fallback.

## 6a. Subpages (About, legal, anything off the home page)

**Build every subpage as a REAL PAGE OF THE APP — never as HTML written by a
Node script.** This is the single most expensive lesson in this build; getting
it wrong costs days and the client sees it as "the subpages look cheap".

*Why generators fail.* Tailwind only scans the files in its `content` glob
(`./index.html`, `./src/**/*.{ts,tsx}`). A utility class typed into a `.mjs`
generator is never seen, so it is purged out of the stylesheet and silently
does nothing. The generator is therefore forced to hand-write substitute CSS —
and a hand-written copy of a design system drifts from it immediately. You end
up maintaining two designs and shipping the worse one.

*The fix.* Use Vite's multi-page build:

```ts
// vite.config.ts
build: { rollupOptions: { input: {
  main:    fileURLToPath(new URL("./index.html", import.meta.url)),
  about:   fileURLToPath(new URL("./ueber-uns/index.html", import.meta.url)),
  privacy: fileURLToPath(new URL("./datenschutz/index.html", import.meta.url)),
  // …one per route
}}}
```

Each route = a thin `index.html` (its own title/description/canonical/OG/
hreflang + `<div id="root">` + a module script) → a mount file in
`src/entries/` → a page component in `src/pages/`. The page then imports the
SAME `Header`, `Footer`, `Reveal`, `RevealText`, `PrimaryCta` and design tokens
the home page uses. There is no second copy of the design left to drift.

**Shared chrome takes an `onSubpage` prop.** `Header`/`Footer` must prefix
in-page anchors with the home path (`/#faq`, not `#faq`) and disable the
scroll-spy, since those sections do not exist off the home page. Keep the nav
list in the ONE shared component so the home page and subpages cannot end up
with different navigation. A nav entry that points at a page rather than a
section carries an explicit `href` plus a `current` prop for its active state.

**Do not mount home-page-only devices on subpages.** A floating scroll widget
that links to `#contact` and decides its own visibility by watching two
home-page section ids will, on a subpage, leave a dead anchor and a widget with
no working show/hide window. Omit it; the page's own CTA is the same ask.

**Language stays a query param (`?lang=en`), never a path prefix.** One URL per
page, language switched client-side exactly as on the home page. Do not create
`/en/*` twins: it is a second, conflicting convention, it doubles the routes,
and it makes the language switcher bounce users to the home page instead of the
equivalent page. If such paths ever shipped, 301 them in `public/_redirects`.

**Layout: background and legal pages are EDITORIAL, not a section stack.**
A card grid is right for a home page, where each panel is a separate claim
competing for a skimming reader. It is wrong for a page that is *read* in
order, and several paragraphs inside a bordered panel is the worst of both.
Use instead:

- a sticky identity card in a narrow left column (legal entity, addresses, and
  a small label/value facts table), and
- ONE continuous right column: `h2` + prose, repeated, with **labelled lines**
  (`**Label:** one sentence`) wherever the content is a list of positions
  ("what we don't promise", "what we stand for") rather than an argument.

Never invent statistics for the facts table. Derive every figure from data that
already drives the site (`locations.length`, `team.length`, `platforms.length`)
so it cannot drift or overstate.

## 7. SEO / AEO / GEO

Classic: title 50–60 chars, description 140–160, canonical, robots
`max-image-preview:large, max-snippet:-1`, full OG + Twitter cards, hreflang,
preconnects. JSON-LD: Organization, WebSite, Service/Product/SoftwareApp,
FAQPage mirroring the visible FAQ exactly, ratings only when real. AEO: one
h1, logical outline, answer-first FAQ (40–60 word direct answers), key facts
in plain text, definition-style entity sentences. GEO: consistent entity
naming + sameAs, `public/llms.txt` brief, citable stat lines, fast prerendered
or noscript-backed HTML. Crawl files: robots.txt (allow all, disallow the
dashboard path, point to sitemap), sitemap.xml with hreflang alternates;
dashboard serves noindex meta + `X-Robots-Tag`.

## 8. Performance playbook

Code-split below-the-fold; defer analytics to load + requestIdleCallback;
subset fonts (≤2 families); preload the LCP asset with a media query;
webp/avif sized to the rendered box; compressed video; animations on
transform/opacity only; justify every dependency; build passes `tsc --noEmit`
and ESLint with zero errors.

## 9. Animation & interaction system

`Reveal` (IntersectionObserver → CSS class) + `RevealText` (masked line
slide-up, descender-safe) with `transition-delay` stagger; smooth scroll
optional and reduced-motion aware; micro-interactions 200–450 ms with
`cubic-bezier(0.22, 1, 0.36, 1)`; seamless CSS marquee; dashboard page
transitions via AnimatePresence 180 ms; FAQ accordion via the CSS grid
`0fr → 1fr` trick; custom video controls inside the frame at all sizes.

## 10. Styling system

Prefixed design tokens in `:root` (bg, alt bg, ink, muted ink, line, accent,
accent hover) consumed by every component — no stray hex in components;
Tailwind config maps the tokens; global CSS holds resets, keyframes and the
few prefixed custom classes; fixed type scale; spacing rhythm from a small
set; every section inside a centered max-width container with consistent
edges.

## 11. Analytics — site-side

Official deferred PostHog snippet, `person_profiles: "always"`,
`disable_session_recording: true`. Autocapture is primary; stable marker
classes on every conversion element (`pm-cta pm-cta-btn` / `pm-cta`). Track
outbound contact links, video play/complete, form submits, language switches.
No PII in properties.

## 12. Analytics dashboard

One data layer file (`data/posthog.ts`) with a `hogql<T>(sql)` helper, shared
fragments, and one exported typed `fetchXxx(days)` per card; conversions split
goals via `countIf`/`uniqIf` on `pm-cta-btn` vs `pm-cta AND NOT pm-cta-btn`,
plus totals and rate (converting ÷ total sessions). `data/mock.ts` mirrors
every interface; pages fall back to mock with a `FallbackNotice`.
`useLiveQuery` re-runs on a 30 s tick and ignores stale responses. Six pages:
Overview (KPI tiles linking onward), Traffic, Engagement, Conversions (funnel
+ one-row-per-goal table + lead-value card), Performance (CWV P75 +
exceptions), Audience. Dark theme, tabular-nums, explicit
empty/loading/error states, a hint line under every metric. Preferred:
serverless proxy for the personal key; shipping it client-side is acceptable
only behind auth, documented as accepted risk.

## 13. Security

`.env` gitignored; only public `VITE_*` keys in the frontend; personal keys
proxied or auth-gated; dashboard path protected + noindexed; CSP,
nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors on the host;
zod-validate all form input; audit dependencies before delivery.

**Generate the CSP from the built output, not by hand** (`scripts/
security-headers.mjs`, run last in `build:all`). It emits `_headers` (Netlify /
Cloudflare Pages) and an nginx variant, hashing every inline script into
`script-src`. Three rules that are each a real, silent-failure bug:

1. **Walk EVERY generated `index.html`, not just the home page.** One global
   `/*` policy applies to all routes, so a subpage's inline script needs its
   hash in that same list or it is blocked everywhere. Collect into a `Set` —
   the same script text repeats across routes.
2. **Hash the browser-normalized text** (CRLF → LF) or every hash is wrong on
   Windows checkouts.
3. **Verify against the SERVED headers, not the generator's own logic.** Serve
   the real build with the real `_headers` applied and assert each page's
   actual inline scripts are permitted. A policy that blocks the app's own
   scripts is worse than no policy, because it fails silently in production.

## 14. Accessibility

Landmarks, one h1, logical tab order, visible focus rings, aria-labels on
icon buttons, aria-expanded/controls on accordions, contrast ≥ 4.5:1 (text) /
3:1 (chrome), meaning never in color alone, reduced motion disables
marquees/smooth scroll/reveals.

## 15. Build & deploy

`npm run build:all` at repo root: build frontend (all page entries in one Vite
pass) → build dashboard → copy dashboard dist under the frontend build output →
generate security headers. Long-cache hashed assets, short-cache index.html.

Note there are **no page-generation steps** in this chain: the subpages are
Vite entries (§6a), so `build:frontend` emits them. If you find yourself adding
a `npm run legal` / `npm run about` step, you are rebuilding the mistake §6a
exists to prevent.

Ship `public/_redirects` for any route that has ever been public and moved.
After deploy verify the site, crawl files, dashboard path, every subpage route,
and one real CTA click reaching the dashboard within a minute.

## 16. Content & copy

Native-quality primary language first, then mirror. Confident, concrete,
benefit-led; numbers over adjectives. Section order: Header → Hero → TrustBar
→ Problems → Solution/How-it-works → Features → Before/After → Testimonials →
FAQ → Team → FinalCTA → Footer. Every section answers "so what?" in its first
line.

## 17. Improvements over the reference project

Vite + TS everywhere; SSG/prerender preferred; no API keys in client bundles
(or documented accepted risk behind auth); `prefers-reduced-motion`; dynamic
`<html lang>` + hreflang; generated sitemap/robots/llms.txt; responsive video
frame; grid-rows FAQ animation; goal attribution by marker class from day
one; security headers documented.

## 17a. Traps that cost real time — check these by hand

Each of these shipped silently and was only caught by looking at the rendered
page. None produces a build error.

- **`overflow-hidden` on an ancestor kills `position: sticky`.** The ancestor
  becomes the sticky element's scrolling container, and since it never scrolls,
  the element rides away like a static block. Use **`overflow-clip`** — it
  contains a blurred background wash just as well but creates no scrollport.
- **`position: sticky` also needs a containing block TALLER than itself.**
  Putting it on the card instead of on a wrapper whose parent is the full-height
  grid column gives it nowhere to travel.
- **`first:` variants match inside per-item wrappers.** `mt-14 first:mt-0` on a
  heading collapses the gap above *every* heading when each heading is the first
  child of its own `<Reveal>` wrapper. Apply between-block spacing on a FLAT
  list by index, in one place.
- **Backticks inside a JS template literal end it.** Writing CSS in a `.mjs`
  file inside `` const CSS = `…` ``, a backtick in a prose comment terminates the
  literal and the file fails to parse with an error pointing at the next
  identifier. (Another reason §6a exists.)
- **Grid cards need `flex-1` on the BODY BLOCK** (not per paragraph) or a short
  card strands its bottom rule mid-panel: grid tracks stretch, content does not.
- **Removing a character can break code that parses copy.** Headline splitters
  that look for a dash or comma to place a colour accent or a line break stop
  working when the copy is edited. Grep for anything reading the string before
  changing dictionary text.
- **Dictionary changes must be mirrored in every language file** when the type
  is inferred from one of them (`type Dict = typeof de`).
- **Verify in a real browser, focused.** A background/hidden tab suspends
  `requestAnimationFrame` and `IntersectionObserver`, so scroll-driven UI
  measures as completely dead and correct code looks broken. Force focus
  emulation first, and have every probe return `document.visibilityState`
  alongside its result so a hidden-tab reading can be discarded.

## 18. Acceptance checklist

- [ ] `build:all` passes (tsc, ESLint, both bundles).
- [ ] First mobile viewport: header → H1 → proof → CTA, no scroll.
- [ ] No horizontal scroll / clipped text / misalignment at 360/768/1024/1440.
- [ ] Lighthouse mobile: Perf ≥ 90, SEO ≥ 95, A11y ≥ 95, BP ≥ 95.
- [ ] Full meta/OG/JSON-LD in view-source; FAQ schema matches visible FAQ.
- [ ] robots/sitemap/llms.txt served; dashboard noindexed.
- [ ] All languages render every string; `<html lang>` updates.
- [ ] CTA and widget clicks appear as two separate dashboard goals.
- [ ] All six dashboard pages load; mock fallback + notice work keyless.
- [ ] Reduced motion settles everything instantly.
- [ ] No secrets in the repo; `.env*` ignored; no business data (CSV exports).
- [ ] Every subpage route returns 200 and is a Vite entry, not generated HTML.
- [ ] Header, footer, fonts, tokens, spacing and reveals are pixel-identical
      between the home page and every subpage (they import the same modules).
- [ ] Language switch keeps you on the equivalent page, in both directions.
- [ ] Zero dead in-page anchors on every route (a subpage must not link to a
      home-page-only `#id`).
- [ ] Served CSP permits every inline script on every route (checked against
      the response header, not the generator).

## 19. Deliverables

The full repo, README (setup/build/deploy/env/security), memory/DECISIONS.md,
a working build (or exact deploy steps), and the checklist filled in with
measured results.
