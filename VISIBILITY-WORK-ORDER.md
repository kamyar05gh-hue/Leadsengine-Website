# Why leadsengine.ch is invisible, and what to change

Measured 08.09.2026 against the live site. Every number below came from a
request or a query that was actually run; nothing is estimated. Where a claim
could not be verified it says so.

This document is written to be executed. Each task names the file, the change,
and the test that proves it worked.

---

## The finding in one line

**1.6 % of the copy on this site reaches a machine that does not run JavaScript.**

The German dictionary holds 56,017 characters of prose. A crawler fetching
`https://leadsengine.ch/` reads 232 characters, or 918 if it also keeps the
`<noscript>` block. Everything else exists only after a 239 KB React bundle
has downloaded and executed.

Google's AI Overview, PerplexityBot, OAI-SearchBot and ClaudeBot fetch HTML.
They are not browsers.

---

## What was measured

| Probe | Result |
|---|---|
| Crawlable text, homepage, outside `<noscript>` | **232 chars** |
| Crawlable text, homepage, including `<noscript>` | **918 chars** |
| Crawlable text, whole site, all 6 pages | **395 chars** outside `<noscript>` |
| German copy written into the app | **56,017 chars** |
| Developer comments shipped to the browser | **7,915 chars** |
| Pages in sitemap | 6 |
| Pages Google has indexed (`site:leadsengine.ch`) | **1** |
| Buyer questions asked on Google AI Overview + Perplexity | 12 |
| Answers naming Leads Engine | **0** |

Comparison: the Swiss agencies the engines named *instead*, measured the same
way on the same day.

| Domain | Homepage text, no JS | Pages in sitemap |
|---|---:|---:|
| zumoseo.ch | 55,055 | 120 |
| seox.ch | 31,589 | 172 |
| rankfender.com | 18,013 | 14 |
| elevenradar.com | 13,507 | 102 |
| loaded.ch | 12,617 | 1 |
| bombelli-analytics.ch | 10,945 | 49 |
| kampadre.ch | 8,617 | 41 |
| web-total.ch | 7,827 | 59 |
| blynx.ch | 7,800 | — |
| techtown.ch | 2,786 | 33 |
| **leadsengine.ch** | **918** | **6** |

Median rival: 12,617 characters. That is **14× more** than this site serves.

None of these are large international products. They are small Swiss agencies.
The bar is not high; the site is simply under it.

---

## The five reasons, in the order they cost you

### 1. The page has no words in it

The site is a client-rendered React SPA. `GET /` returns a shell: a `<title>`,
JSON-LD, `<div id="root">` and a script tag.

`scripts/seo.mjs` already identified this and injects a `<noscript>` block per
page. That was the right instinct and it is not enough:

- The homepage `<noscript>` is **686 characters** — a summary, not the page.
- `<noscript>` is a fallback element. Whether an HTML-to-text pipeline keeps it
  varies by engine and is not something you control. Outside it there are 232
  characters, and that is the floor you are actually planning against.

There is a second, smaller leak: **7,915 characters of developer comments** are
shipped to the browser, and on the homepage one of them contains a literal
`-->` inside a code sample, which ends the comment early and spills the rest
into the readable text. A crawler reading leadsengine.ch today receives more
prose about preload plates and CSP hashes than about the product.

### 2. Six pages exist, one is indexed, and its snippet is from a different site

`site:leadsengine.ch` returns exactly one result. Its description reads:

> Leads Generator für effektive Lead Generierung und E-Mail Updates.
> Abonnieren Sie unseren Newsletter für die neuesten Informationen!

That sentence appears nowhere in the current HTML. The live meta description is
"Deine Kunden fragen KI statt Google. Leads Engine macht Dein Unternehmen in
ChatGPT & Co. sichtbar…". Google is holding a description from an older version
of this domain and has not recrawled since. The five other pages are not in the
index at all.

### 3. The one content section is switched off

`frontend/vite.config.ts` lines 37–41 pull `/wissen/` and
`/wissen/was-ist-geo/` from the Rollup inputs "at the client's request". Both
404 in production and neither is in the sitemap. The source, entries,
translations and `scripts/seo.mjs` routes are all still in the repo.

Every rival above has between 14 and 172 pages. This site has 6, and 4 of those
are legal boilerplate: imprint, privacy, terms, plus about.

### 4. Nothing on the site answers a buyer's question

Asked "Wer bietet in der Schweiz AI Visibility Monitoring an?", Perplexity
returns a **comparison table** with columns for provider, location, focus,
price level and differentiator, populated with loaded.ch, TH Analytica,
Standout GmbH, SEOX/aimaco.ai and TechTown.

It builds that table from pages that state those facts in plain text. This site
publishes no price, no comparison-ready description of what is included, and no
page whose heading is a question a buyer types.

Google showed an AI Overview for **5 of the 6** buyer questions tested, so the
surface exists and is active for this category. It is being filled by others.

### 5. The brand name is contested and uncorroborated

A search for `"leadsengine"` surfaces leadsengine.ai, leadsengine.app and
leadsengine.realogy.com alongside this domain. No Swiss press, directory or
third-party page describing Leads Engine appeared in any of the 15 probes.

In the September real-estate measurement the pattern was consistent: the two
most-cited domains belonged to the two most-named firms, and firms named
without their own domain cited were being described from other people's pages.
This site has neither its own readable pages nor anyone else's.

---

## What to change

Ordered by result per unit of work. Task 1 is worth more than everything below
it combined; do not start at the bottom.

### P1 — Prerender the routes. Put the real markup in `<body>`.

**Why:** it converts 232 crawlable characters into the full page for every
engine, in one change, with no new copy to write.

**Stack facts that make this cheap:** Vite 7 multi-page build, React 19, no
router. Each route already has its own `index.html` and its own entry in
`frontend/src/entries/*.tsx`. The routing problem that usually makes SPA
prerendering awkward does not exist here.

**Do this:**

1. Add a build step after `vite build` that, for each entry, renders the page
   component with `renderToString` from `react-dom/server` and injects the
   result inside `<div id="root">…</div>` of the built HTML.
2. Change `frontend/src/main.tsx` and each `entries/*.tsx` from
   `createRoot(el).render(<App/>)` to `hydrateRoot(el, <App/>)`.
3. Guard anything that touches `window`, `document`, `IntersectionObserver` or
   `matchMedia` during first render. Likely candidates from the component list:
   `CursorGlow`, `Parallax`, `ScrollProgress`, `ScrollMarquee`, `Typed`,
   `Reveal`, `RevealText`, `Counter`, `VideoPlayer`, `HeroEngine`.
   Render the final visible state on the server; start the effect on mount.
   Nothing that carries a word may depend on an effect to appear.
4. Run `scripts/seo.mjs` **after** the prerender, and reduce it to JSON-LD only.
   Keep `<noscript>` if you like, but it stops being the mechanism.
5. `scripts/security-headers.mjs` runs last and hashes inline scripts — check
   the CSP still passes after markup changes.

**Alternative if a renderer in the build is unwanted:** `vite-react-ssg`, or a
Puppeteer prerender pass. Both are heavier than the above for six pages.

**Acceptance test:**

```bash
node scripts/crawlable-text.mjs                 # the live site
node scripts/crawlable-text.mjs frontend/build  # a build, before deploy
```

That script ships with this document. It reports, per route, the text a
crawler reads with JavaScript off, the `<noscript>` block separately, and how
many bytes of comments are being served. It exits non-zero while any route is
short, so it can gate a deploy.

Today it prints:

```
route            text   <noscript>  comments   verdict
/                232         686      4350   under 6000
/analyse/         46         244       741   under 1500
/ueber-uns/       40         551       741   under 1500
/impressum/       24         566       741   under 1500
/datenschutz/     35        1047       741   under 1500
/agb/             18        7590       741   under 1500
```

The homepage must clear 6,000 and every other route 1,500, from the `text`
column, not the `<noscript>` one.

### P2 — Delete the developer comments from the build output

**Why:** 7,915 characters of build notes are being served, one of them breaks
its own comment and leaks into the readable text.

**Do this:** strip HTML comments in the build (a small step in
`scripts/assemble.mjs`, or Vite's HTML minifier). Keep the notes in source
where they belong.

**Acceptance:** the `comments` column in `scripts/crawlable-text.mjs` reads 0
for every route, and the words "preload", "HeroEngine.tsx" and "CSP" no longer
appear in the crawlable text.

### P3 — Ship `/wissen/` and give it something to hold

**Why:** it is the only route on the site that can ever rank for a question,
and re-enabling it is two lines.

**Do this:**

1. Restore the two Rollup inputs in `frontend/vite.config.ts` (the comment at
   lines 37–41 states this is the entire re-enable).
2. Restore the matching entries in the `ROUTES` array in `scripts/seo.mjs`.
3. Add both URLs to `sitemap.xml`.
4. Then write pages. One page per question, heading **is** the question:
   - Wie sehe ich, ob ChatGPT mein Unternehmen empfiehlt?
   - Wer bietet in der Schweiz AI Visibility Monitoring an?
   - Wie werde ich in KI-Antworten sichtbar als Schweizer KMU?
   - Was kostet AI-Sichtbarkeit in der Schweiz?
   - Was ist der Unterschied zwischen SEO, AEO und GEO?
   - Welche KI-Crawler muss ich in robots.txt zulassen?
   - Wie misst man Share of Voice in ChatGPT?

   Each page: the question as `<h1>`, a **40 to 60 word direct answer as the
   first paragraph**, then the evidence. That opening paragraph is what an
   engine lifts. Add `FAQPage` JSON-LD per page; the pattern already exists on
   the homepage.

**Acceptance:** `/wissen/` stops reporting "not found" in
`scripts/crawlable-text.mjs`, appears in the sitemap, and each new page serves
more than 3,000 crawlable characters.

### P4 — Publish the facts a comparison table needs

**Why:** Perplexity already builds that table for this category. It cannot
include a provider whose price and scope are not written down anywhere.

**Do this:** one page, `/leistungen/` or a block on `/analyse/`, in plain
crawlable prose, stating: what is included, how many platforms, how many
prompts, reporting cadence, **what it costs**, where the company is, and who it
is for. Rivals publish "ab CHF 1'000/Monat" and "CHF 79–299/Monat" and are in
the table because of it.

If the price is genuinely not public, publish a band or a starting point. A
provider with no price is not comparable and gets left out of the comparison.

### P5 — Get the index refreshed

**Why:** the one indexed page carries a description from a previous site.

**Do this:**

1. Search Console → URL inspection → Request indexing, for all six URLs plus
   the new ones.
2. Resubmit `sitemap.xml`.
3. `scripts/indexnow.mjs` already exists. Wire it into the deploy so Bing and
   Yandex are pinged on every publish.
4. Re-run `site:leadsengine.ch` in two weeks. The snippet must match the
   current meta description, and the count must be > 1.

### P6 — Be cited by someone other than yourself

**Why:** across the 12 buyer answers, every source the engines cited was a
third-party page. None of them was a vendor's homepage.

**Do this:**

1. Publish the September real-estate AI-visibility study as a public page. It
   is a measured piece of Swiss research in exactly this category, which is
   what gets cited. It currently exists only as a private artifact.
2. Get listed where the named rivals are listed: Swiss agency directories,
   Bern and Zurich startup listings, the local chamber.
3. One or two guest pieces or interviews on Swiss marketing sites.

---

## What NOT to change

These were checked and are already correct. Leave them alone:

- **`robots.txt`** — names and allows GPTBot, OAI-SearchBot, PerplexityBot,
  ClaudeBot, Claude-SearchBot and Google-Extended explicitly. Better than
  almost every site measured in the September study.
- **`llms.txt`** — present, 2,605 characters, accurate.
- **JSON-LD** — every page has a block; the homepage carries Organization,
  WebSite, Service and FAQPage.
- **`sitemap.xml`** — present, with hreflang alternates and lastmod.
- **Canonicals and hreflang** — present and correct.
- **`<title>` and meta descriptions** — written, distinct, accurate.

This is the important part of the diagnosis: **the technical SEO is done.** The
problem is not a missing tag. It is that the pages have no text in them, there
are only six of them, and none of them answers a question anyone asks.

---

## How to know it worked

Re-run the same 12 buyer questions on Google and Perplexity in 30 days. The
measuring script is at
`ALBAA scratchpad/le_visibility.py`; it takes the queries as a list and needs
no API key, only a logged-in browser.

Today's baseline: **0 of 12**.

A realistic first target is not "named in all 12". It is being named in the two
questions that describe the product most literally, and appearing in
Perplexity's provider table. That table is the single most valuable position in
this category, and entry to it is a page that states scope and price in text.
