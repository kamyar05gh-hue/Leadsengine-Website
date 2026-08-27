# Leads Engine — product requirements (condensed)

## What it is

**Leads Engine** is the Swiss **AI Buyer Visibility** platform by Future Media
(Bern & Zürich). It analyses how a company appears in AI-generated answers
(ChatGPT, Gemini, Claude, Perplexity, Grok), identifies which competitors are
recommended and why, closes the visibility gaps, and measures the result
continuously as **Mention, Zitation and Share of Voice**.

Core promise: *Deine Kunden googeln nicht mehr. Sie fragen KI.*
Supporting line: *Wir machen Dein Unternehmen in ChatGPT & Co. sichtbar,
empfohlen und messbar.*

## Audience

Swiss CEOs, marketing and sales leads — decision-makers who decide on numbers.
Market: Switzerland. Languages: German (de-CH, primary), English.

## The one conversion

**Kostenlose KI-Analyse starten** → the free analysis / first consultation
(Calendly). No pricing on the site; the page exists to convert visitors into
the free analysis. Every solid CTA carries `pm-cta pm-cta-btn`; the header
outline CTA carries `pm-cta`.

## The story the page must tell, in order

1. What changed — customers ask AI instead of googling (3 sourced stats).
2. The problem — AI answers have no page 2; 3–5 providers get named (Früher/Heute + chat mock-up).
3. What Leads Engine is — it shows not just *whether* AI knows you but *why it recommends others*, and changes that (flow diagram).
4. How it works — 5 steps: website analysis → real customer questions → query the AI models → competitor analysis → implementation & optimisation; then the monthly loop.
5. Why it works — buyer-intent questions, not generic visibility; what other tools get wrong.
6. What it measures — Mention, Zitation, Share of Voice.
7. The dashboard.
8. Benefits — visible at the moment of purchase, measurable, more than SEO, continuously better, from Switzerland.
9. Voices (placeholder testimonials).
10. Who we are — Future Media, three pillars, the team.
11. How to start — free analysis → report review (15 min, no pitch) → optimise and measure.
12. Proof in numbers — the anonymised real audit.
13. FAQ (8, mirrored in JSON-LD).
14. Final CTA — *Wirst Du von KI empfohlen – oder Deine Konkurrenz?*

The visitor must never have to ask "what does this company actually do?".

## Non-functional targets

LCP < 2.5 s, INP < 200 ms, CLS < 0.1 on 4G mobile; initial JS < ~200 KB gzip;
WCAG 2.2 AA; `prefers-reduced-motion` respected everywhere (the hero engine
renders static); continuous animation limited to the engine, data streams,
particles and node floating; off-screen animation paused; no horizontal
overflow at 360px; TypeScript strict + ESLint clean.

## Dashboard

Private analytics at `/dashboard/` (six pages, 30 s refresh, EN/DE, PostHog
HogQL with mock fallback). Conversions split into the primary CTA goal and the
header CTA goal.
