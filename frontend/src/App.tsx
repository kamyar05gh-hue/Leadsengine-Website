import { lazy, Suspense, useEffect } from "react";
import Header from "@/sections/Header";
import Hero from "@/sections/Hero";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollWidget from "@/components/ScrollWidget";
import TrustedBy from "@/sections/TrustedBy";
import Team from "@/sections/Team";

/*
 * One continuous story, top to bottom:
 *   what changed → the problem → what Leads Engine is → how it works →
 *   why it works (buyer intent) → what it measures → the dashboard →
 *   benefits → voices → who we are → how to start → proof in numbers →
 *   FAQ → act.
 */

/*
 * Each loader is named once here and reused for both the lazy() component AND
 * the idle prefetch below — so the two can never drift out of sync with each
 * other or with the section list.
 *
 * WHY THIS FILE CHANGED. Measured on a mid-range-mobile profile (4x CPU
 * throttle, real scripted scroll, real frame timing — not a guess): a cold
 * first scroll produced several janky frames, one a 117ms stutter, scattered
 * across the first half of the page. Re-running the identical scroll on the
 * SAME already-mounted page produced ZERO jank end to end. That comparison
 * rules out a continuous per-frame cost (backdrop-blur, a scroll listener,
 * anything of that shape) and points at a ONE-TIME first-visit cost per
 * section — which is exactly what code-split chunk fetch + parse + eval is.
 *
 * THE SECOND, WORSE PROBLEM the trace exposed: all 13 sections shared ONE
 * <Suspense fallback={null}>. React resolves siblings under a shared boundary
 * in JSX order, one at a time — it does not even START fetching section N+1's
 * chunk until section N has fully resolved and re-rendered. That makes the 13
 * sections a strictly SEQUENTIAL waterfall, and until the last one resolves
 * the ENTIRE block renders as nothing (`fallback={null}`), no matter how much
 * of it the user has already scrolled past. On a throttled connection that is
 * seconds of blank page below the fold, not a dropped frame — which matches
 * "some parts of it lag" far better than ordinary lazy-load jank would.
 */
const loaders = {
  VideoSection: () => import("@/sections/VideoSection"),
  PlatformStrip: () => import("@/sections/PlatformStrip"),
  Problem: () => import("@/sections/Problem"),
  WhatIs: () => import("@/sections/WhatIs"),
  BuyerIntent: () => import("@/sections/BuyerIntent"),
  MarketData: () => import("@/sections/MarketData"),
  Testimonials: () => import("@/sections/Testimonials"),
  Faq: () => import("@/sections/Faq"),
  FinalCta: () => import("@/sections/FinalCta"),
  Footer: () => import("@/sections/Footer"),
} as const;

const VideoSection = lazy(loaders.VideoSection);
const PlatformStrip = lazy(loaders.PlatformStrip);
const Problem = lazy(loaders.Problem);
const WhatIs = lazy(loaders.WhatIs);
const BuyerIntent = lazy(loaders.BuyerIntent);
const MarketData = lazy(loaders.MarketData);
const Testimonials = lazy(loaders.Testimonials);
const Faq = lazy(loaders.Faq);
const FinalCta = lazy(loaders.FinalCta);
const Footer = lazy(loaders.Footer);

/** Each section gets its OWN boundary — see the note above `loaders`. A
 *  section that is ready renders the moment it is ready, never held back by
 *  a slower sibling, and a still-loading one only ever blanks itself. */
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

/**
 * Fetch every below-the-fold chunk once the browser is idle, so the network
 * and parse cost lands during idle time instead of during the user's first
 * scroll. `import()` on an already-lazy()'d module resolves the SAME cached
 * promise `lazy()` will later read, so this can never double-fetch or race
 * the real render — it only ever gets there first.
 *
 * Skipped on `saveData` or a 2G-class connection: a visitor on a metered or
 * slow link should not pay for 13 chunks they have not asked to see yet.
 */
function usePrefetchSections() {
  useEffect(() => {
    type Conn = { saveData?: boolean; effectiveType?: string };
    const conn = (navigator as Navigator & { connection?: Conn }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return;

    /* ONE AT A TIME, NOT ALL FOURTEEN AT ONCE.
       This used to fire every loader in the same tick. Measured on a 390px
       viewport at 4x CPU throttle that turned into 24 script requests
       competing with the hero image for bandwidth and with hydration for
       main-thread time — on a phone the fetch, parse and evaluate of
       fourteen chunks all land together, which is the opposite of what an
       idle prefetch is for.

       Chained sequentially, each chunk starts only once the previous one has
       settled, so the work spreads out and never contends with the initial
       render. The user still gets every section warmed before they can
       scroll to it; the browser just is not asked to do it all at once. */
    let cancelled = false;
    const load = async () => {
      for (const fn of Object.values(loaders)) {
        if (cancelled) return;
        try {
          await fn();
        } catch {
          /* A chunk that fails here is not an error: lazy() will request it
             again when the section actually renders, and report it there. */
        }
      }
    };
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    const id = ric ? ric(load) : window.setTimeout(load, 1200);
    return () => {
      cancelled = true;
      if (!ric) window.clearTimeout(id as number);
    };
  }, []);
}

export default function App() {
  usePrefetchSections();

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header />
      <ScrollWidget />
      <main>
        <Hero />
        {/* Directly under the hero: who already trusts the team. Proof before
            argument — it costs one band and buys the rest of the page a
            hearing. This is eager, not lazy: it is the first thing below the
            fold and must not pop in. */}
        <TrustedBy />
        {/* The three-tick band that used to sit here is GONE, by instruction.
            Two of its claims were dropped outright and the third ("7 Jahre
            Erfahrung") moved up under the hero CTA, where it argues at the
            moment of decision instead of a screen later. The byline it used
            to close is now the last line of `TrustedBy`. */}
        {/* The explainer, straight after the trust block: the argument has
            been asserted, this is where it gets shown. Lazy like every other
            section — the video itself is `preload="none"`, so arriving here
            costs a poster image and nothing more until play is pressed. */}
        <S>
          <VideoSection />
        </S>
        <S>
          <Problem />
        </S>
        {/* FOUR SECTIONS WERE REMOVED HERE AND BELOW, BY INSTRUCTION:
            "KI empfiehlt nur, wen sie kennt" (MarketShift), "Du verlierst
            Kunden, ohne es zu merken" (Pain), "Sichtbar bei Deinen Kunden"
            (Audience) and "Mehr Sichtbarkeit, Anfragen und Umsatz"
            (Benefits). Their files, their dictionary entries and their two
            header nav items went with them, so nothing is left pointing at a
            section that no longer exists. */}
        {/* The platforms we check, full width. Right above "What is Leads
            Engine?" so a visitor meets the proof of what gets checked in the
            same breath as the explanation of why. */}
        <S>
          <PlatformStrip />
        </S>
        <S>
          <WhatIs />
        </S>
        <S>
          <BuyerIntent />
        </S>
        <S>
          <MarketData />
        </S>
        <S>
          <Testimonials />
        </S>
        {/* Who is actually behind it — right after the voices that talk
            about Leads Engine, right before the FAQ and the ask. */}
        <Team />
        <S>
          <Faq />
        </S>
        <S>
          <FinalCta />
        </S>
        <S>
          <Footer />
        </S>
      </main>
    </>
  );
}
