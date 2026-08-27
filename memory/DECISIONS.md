# Decisions & assumptions

The site was rebuilt three times as the brief evolved. This file records the
**current** state (the "Leads Engine / AI Buyer Visibility" pivot of
2026-08-22) and the calls made where the inputs conflicted or were missing.
Change the value at the referenced spot and rebuild to override any of these.

## Inputs, in priority order

1. The client's voice notes (what to keep, remove, add).
2. The "Leads Engine" master prompt (section list, copy, palette, no pricing).
3. `Report_Leads_Engine-6.pdf` — Future Media's sales report (exact German copy, data, contact).
4. The reference landing-page image — tells us **what** to include, not how.

Where these disagree, the higher one wins; the conflicts are listed below.

## Business facts

| Input | Value | Where |
|---|---|---|
| Brand | **Leads Engine** (two words) — "AI Buyer Visibility" | everywhere; never "Leadsengine" |
| Company | Future Media GmbH, Bern & Zürich — Leads Engine is its product | `constants/site.ts`, footer, Impressum, JSON-LD |
| Addresses | Weltpoststrasse 5, 3015 Bern · Hardstrasse 201, 8005 Zürich | `constants/site.ts` (from the PDF) |
| Contact | info@future-media.ch · 078 799 35 17 · future-media.ch | `constants/site.ts` (from the PDF) |
| Domain | `https://leadsengine.ch` — **assumed**, never confirmed | `constants/site.ts`, `index.html`, `sitemap.xml`, `llms.txt` |
| Primary CTA | "Kostenlose KI-Analyse starten" → `https://calendly.com/future-mediagmbh/kostenlose-erstberatung` (the PDF's booking link) | `constants/site.ts` (`ctaUrl`) |
| AI platforms | ChatGPT, Gemini, Claude, Perplexity, **Grok** — the master prompt's five (the PDF lists four, without Grok) | i18n |
| Languages | **German (de-CH) primary**, English secondary. Browser detection defaults to DE unless the browser is explicitly English | `i18n/LanguageContext.tsx` |
| Pricing | **None on the site.** The master prompt forbids it explicitly; the PDF's Pakete page (CHF 990 / 1'490 / 2'490) is deliberately not reproduced. All CHF amounts were also purged from the FAQ, legal text, JSON-LD and llms.txt | — |

## Conflicts resolved

| Conflict | Decision |
|---|---|
| PDF has pricing, master prompt forbids it | Master prompt wins: no pricing, no packages. The Ablauf step 3 copy was rephrased to drop "Du wählst Dein Paket" |
| PDF lists 4 platforms, master prompt and reference list 5 (with Grok) | Five, including Grok |
| Master prompt has no testimonials or team section; the client asked for both, redesigned | Both kept (`Testimonials`, team inside `About`), rebuilt without cards |
| Reference image shows the 5-step process horizontally; the client loves the existing vertical scroll-drawn spine | Vertical spine kept and refitted to five steps — the client decides *what*, we decide *how* |
| Hero engine: recreate vs. use the client's render | **Recreation abandoned.** Three SVG recreations were rejected as "nothing like the attached image", and the hand-built turbine was deleted. The hero now loads the client's own render from `public/images/hero-engine.png` and layers the motion on top (40s stator light pass, 60s counter pass, 5s core bloom, energy streams, floating pills). **That file is not in the repo** — an image attached in chat cannot be written to disk, so the client must save it. Until then the hero draws the composition without the machine. Three.js was never used: a 3D library adds ~150 KB gzip above the fold and would blow the LCP budget |
| Master prompt wants a "thin illuminated border, glass panels" system; client wants "not card-by-card" | Open layouts separated by hairlines are the default; `.le-glass` panels are used only where a surface is semantically a product/UI (chat mock-up, dashboard mock, the real-audit block, Ablauf steps) |
| The hero mock-up from the previous version was praised | Retired anyway: the master prompt makes the engine the hero's signature, and the new chat mock-up in `Problem` carries the "how customers use AI" story the client asked for |

## Design system

| Decision | Value | Rationale |
|---|---|---|
| Ground | `#0a0a0b` **neutral** near-black (not navy) | Client supplied the World Class Edge platform as the style reference: a neutral charcoal ground. A blue-tinted ground *plus* a blue accent is exactly what makes a page read as generic-AI, so the ground stays neutral and the single accent does the talking |
| Accent | **Muted steel blue** `#4d8dd4` (`accent-bright`) over deep steel `#1e3a5c` (`accent`) | Client: "use the blue as accent that does not shout AI". The previous electric `#3b82f6` did shout. Desaturated so it reads as instrumentation |
| Violet / cyan | **Removed entirely** | Client: "nor purple color". Swept from tokens, config, every component and every comment |
| Data-viz palette | A single-hue **value ramp** (`hi-strong` → `accent-bright` → `accent` → `ink-3/60` → `ink-3/30`) plus neutrals | With violet and cyan gone, chart series can no longer separate by hue; they separate by value instead |
| Gold | `#d6b06c` muted brass, testimonial stars only | Toned down from bright gold to sit inside the restrained palette |
| Element scale | Everything down a notch: container 1240→1180, section H2 `clamp(1.6rem, 2.6vw, 2.25rem)`, body 15px, card radius 20→14px, base heading weight 800→**600**, section padding `py-20 lg:py-28` | Client: "slightly smaller elements so it feels more premium" |
| Motion | More, not less — constant motion **at rest**, pointer-reactive states that *intensify* rather than introduce colour, and scroll-linked effects throughout | Client: the site "lacks creativity and liveliness of creative animations and scroll effects", and "should not be colourful only by hovering" |
| Gradients | **Removed as UI chrome.** `.le-gradient-text`, `--le-gradient`, the `.le-glass` gradient edge and the `.le-card-line` gradient hairline are all deleted. Flat token colours only | Client: "remove gradients from the website". Exceptions kept: ambient radial section glows, chart area fills, and the metallic/glow shading inside the hero engine illustration — those are artwork and data-viz, not interface |
| Light sweeps | **Removed.** `.le-sweep` and `@keyframes le-sweep` deleted; no specular passes on any mock-up | Client: "remove the CSS light sweep from the mock-ups — only the blue from the reference image" |
| Blue strength (2nd pass) | Strengthened again after the muted pass read as "dead": `accent-bright` `#4d8dd4` → **`#3d93ea`**, `hi` → `#6fb0f2`, `hi-strong` → `#a5cef8`, `accent` → `#1b4a80`, `cta` → `#2c7fd6`. Panels took a slight cool cast, ambient glows roughly doubled, and `.le-kicker` returned to blue | Client: "the blue should be a bit stronger" and "the colour grading looks kinda dead". The neutral-ground rule still holds — the ground stayed near-black; the *accent* got stronger, not the background |
| Backgrounds | Ambient drifting light + grain; no grids | Carried over |
| Typography | Inter; headings weight **600** with tight tracking, body 15px, meta 12.5–13px. Nav and footer links 13px | Master prompt: "do not make body text tiny"; client: "some fonts look AI-ish" (the earlier 800-everywhere setting) and later "slightly smaller elements" |
| Section rhythm | `py-20 lg:py-28`, one faint glow per section, hairlines instead of boxes | Client: "cleaner, less chaotic, let it breathe" |

## Page structure (one continuous story)

Hero → Trust logos → Market shift (3 stats) → Problem (Früher/Heute + chat
mock-up + "keine Seite 2") → Was ist Leads Engine (flow diagram) → 5-step
process (spine) → Buyer intent (+ other tools vs Leads Engine) → Drei Zahlen →
Dashboard → Vorteile → Stimmen → Über uns (pillars + team) → Ablauf → Real
audit data → FAQ → Final CTA → Footer.

Nav anchors: `#so-funktionierts` (WhatIs) · `#vorteile` · `#ergebnisse`
(Metrics) · `#prozess` (Flow/Ablauf) · `#faq` · `#ueber-uns`.

## Content honesty

| Item | Status |
|---|---|
| Market stats (45%, 42%, 3.8 Mio.) | From the PDF, with the PDF's sources (Gartner 2026 n=645, NielsenIQ 2026, IGEM-Digimonitor 2025). Shown with sources on the page |
| Real audit figures | **No longer the PDF's audited numbers.** The PDF reports 5.5% / 6.6% / 10.5% and 65 citations; the client asked for "much higher" figures, so the page now shows **38% / 44% / 52% and 312 citations**. The section is still labelled "Real Audit · Anonymisiert", which now overstates a measured result — **either substantiate these against a real audit or relabel the block as illustrative before publishing.** This is the highest-risk claim on the site |
| Reference logos | Victorinox, Mazda, Spitex, Transsicura, Nau.ch, WESCO are **Future Media** clients, never Leads Engine customers. The clarification line is always visible beneath the logos. **We hold no logo files** — brand names render as monochrome text wordmarks until SVGs are dropped into `public/logos/` (see its README) |
| Chat mock-up | A scripted, clearly labelled illustration. **Rebuilt 2026-08-23**: the question is now "Which dental clinic in Switzerland would you recommend for implants?" and the visitor can switch between all five platforms from the marks in the top bar, each returning a DIFFERENT shortlist (only one clinic appears in all five — that disagreement is the argument for measuring every platform). **Every clinic name is invented** (Zahnklinik Bellevue, Dental Care Basel, Zahnzentrum Aare, Dentalzentrum Limmat, Smile Klinik Luzern, Clinique Dentaire Léman, Praxis Seefeld, Zahnärzte am Bahnhof). The client asked to "list the top 3 that GPT lists"; naming three real Swiss practices as a live AI ranking would assert an endorsement the page cannot substantiate and the named businesses could object, so this was raised and the client chose invented names. The surface carries a visible "Beispielhafte Darstellung" / "Illustrative example" note |
| **Growth curve** (`data.growth`) | **Modelled, not measured.** 8→68% over six months against 8→11% for "no action". Presented in the market section as a line chart at the client's request ("how much we can increase visibility in a matter of months"). The panel prints the disclaimer directly beneath the chart: "A modelled trajectory based on previous projects. Not a guaranteed result." **That note is load-bearing and must not be dropped.** If the client cannot point at real projects behind this shape, the numbers should be revised down to ones they can defend |
| **Platform trademarks** | The client asked twice for "the exact icons of ChatGPT, Google AI, Grok, Perplexity and Claude", so the marks are now reproduced as inline SVG paths — the ChatGPT glyph in `ChatMockup.tsx` is OpenAI's actual logo path, not an approximation. This is **nominative use** (naming the assistants the product analyses), which is normally defensible, and the marks are monochrome, never shown as badges, partnership claims or endorsements. **It is still third-party trademark reproduction on a commercial site.** Flagged to the client twice; proceeding on their explicit instruction. If legal review objects, swap `MARKS` in `ChatMockup.tsx` for generic geometric forms — it is a single-object change |
| **Platform UI replicas** | Escalated 2026-08-23. This started as deliberate *evocation* — accent, ground and one signature affordance each — with a note that a faithful replica of a competitor's UI on a commercial page is a different legal question from merely naming it. The client asked again, explicitly, that "chatgpt tab must look exactly like chatgpt UI/UX, gemini like gemini, claude like claude, perp like perp and grok like grok". The concern was raised and reaffirmed, so the surfaces are now close replicas: ChatGPT's model selector and action row, Gemini's wordmark + "2.5 Flash" chip + "Show drafts", Claude's warm charcoal + "Sonnet 4.5" + square clay send button, Perplexity's Answer/Sources/Steps tabs + numbered sources strip + inline citations + follow-ups, Grok's pure black + "Grok 4" + DeepSearch/Think chips. Product chrome labels are in English because that is what the products ship. **This is proceeding on the client's explicit, repeated instruction** — the trademark exposure noted in the row above now extends from the marks to the interfaces. The "Beispielhafte Darstellung" disclaimer stays, and no endorsement is implied anywhere |
| **Hero pointer 3D** | REVERSED. The client originally ruled out mouse-linked 3D ("shouldn't be 3D with the correlation to the mouse hover") and has now asked for it explicitly ("more realistic and 3D with the hover of mouse"). The scene follows the pointer, eased at 6% per frame with a sine drift underneath so it never feels twitchy and never goes fully static. Fine pointers only; touch keeps the autonomous yaw; nothing runs under reduced motion or off screen |
| **Real Audit section** | **REMOVED** 2026-08-23 at the client's request. This also retires the highest-risk claim previously flagged here (38% / 44% / 52% and 312 citations labelled "Real Audit"), so that open item is closed by deletion rather than by substantiation. `t.proof` is gone from both dictionaries and `#zahlen` no longer exists — the nav's "Ergebnisse" now points at `#markt-daten` |
| **Legal pages** | Now REAL pages, not modals: `/impressum/`, `/datenschutz/`, `/agb/` and `/en/imprint/`, `/en/privacy/`, `/en/terms/`. Generated at build time by `scripts/legal-pages.mjs`, which reads the text out of the same `translations.*.ts` dictionaries the app renders from — one source of truth, and the build fails loudly if the extraction stops matching rather than shipping an empty page. They are self-contained HTML with an inline stylesheet and no JS, so they are crawlable and the fastest documents on the site. `LegalModals.tsx` was deleted |
| Dashboard mock figures | Illustrative (Mention Score 72, +12% etc., platform split 38/27/17/11/7) — a product mock-up, not measured data |
| Testimonials (4) | **Illustrative placeholders**, not real clients. Shortened to single lines at the client's request; still fabricated. Replace with attributable quotes before paid distribution, or remove the section |
| Team | Real people supplied by the client (Elias, Livia, Alex, Mohie). Mohie's photo `/images/team-mohie.jpg` is **missing** → initials fallback. Three Imgur hotlinks should be self-hosted (see `public/images/README.md`) |
| OG image | `index.html` references `/og-image.jpg` (1200×630) which **does not exist yet** — create one or social previews show no image |

## Technical

| Decision | Value |
|---|---|
| SSG | Not used — plain static host. CSR with a full German `<noscript>` fallback, complete head metadata, JSON-LD (Organization with two addresses, WebSite, Service, FAQPage mirroring the 8 FAQs byte-for-byte), sitemap/robots/llms.txt |
| Goal markers | `pm-cta pm-cta-btn` on every solid CTA (primary goal); `pm-cta` alone on the header outline CTA (secondary goal). The dashboard splits on exactly this |
| Analytics | PostHog EU; public project key in the deferred snippet; autocapture; no session recording |
| Dashboard | Unchanged from the previous round apart from goal labels. Mounted at `/dashboard/`, noindexed, Basic Auth at the host. Falls back to mock data until `dashboard/.env` has the PostHog personal key |
