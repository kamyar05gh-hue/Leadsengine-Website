import { useEffect, useRef } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { ShieldCheck } from "lucide-react";
import SwissFlag from "@/components/SwissFlag";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import PrimaryCta from "@/components/PrimaryCta";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import HeroEngine from "@/components/HeroEngine";


/**
 * Hero: copy left, engine right, and a lot of dark air.
 *
 * No stats strip, no star rating, no typing line — the page has to breathe,
 * and everything that used to fight the headline now lives further down.
 *
 * The binding typographic constraint is the German second line, "googeln nicht
 * mehr." — it has to hold on ONE line at 1024 / 1280 / 1440 / 1920 and still
 * fit at 360. That line runs 9.09em in Inter 600 at -0.03em. The column it
 * lives in is a deterministic fraction of the container — 0.92 of the
 * 0.92/1.08 split, minus the gap — and the container caps at 1180, so past
 * 1280 the column stops growing at 480px while `vw` keeps climbing. That is
 * the whole reason the scale is capped where it is.
 *
 * MEASURED in Chrome, `clamp(2.05rem, 4.2vw, 3.05rem)`, every line one line:
 *
 *              column   H1 size   longest line   headroom
 *   360         305*    32.8px       298px          7px
 *   1024        409     43.0px       391px         18px
 *   1280        480     48.8px       444px         36px
 *   1440/1920   480     48.8px       444px         36px
 *
 *   * 305 is the 360px case WITH a desktop scrollbar; a real 360px phone has
 *     no scrollbar and the column is 320, i.e. 22px of headroom.
 *
 * The requested 3.6rem cap was measured and rejected: at 1280 it puts the line
 * at 489px against a 480px column and it wraps. 3.05rem is the largest cap that
 * survives every breakpoint, and the 4.2vw coefficient is kept intact.
 *
 * The accent line is index 2 so all three lines stack as one headline inside a
 * single RevealText mask sequence.
 */
export default function Hero() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();

  const copyRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);

  /* Scroll response: the engine recedes slightly and the copy steps back. One
     rAF-throttled listener, transform and opacity only, skipped entirely under
     reduced motion. The scroll hint it also used to fade is gone. */
  useEffect(() => {
    if (reduced) return;

    const copy = copyRef.current;
    const engine = engineRef.current;
    if (!copy || !engine) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const y = Math.max(window.scrollY, 0);
      const p = Math.min(y / 600, 1);
      engine.style.transform = `scale(${(1 - p * 0.06).toFixed(4)})`;
      copy.style.opacity = (1 - p * 0.4).toFixed(3);
      copy.style.transform = `translate3d(0, ${(p * -14).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      copy.style.opacity = "";
      copy.style.transform = "";
      engine.style.transform = "";
    };
  }, [reduced]);

  return (
    <section
      id="top"
      /* Short enough that the platform strip below is fully on screen at
         first glance on a laptop — the client asked for the loop to be
         visible without scrolling. The strip runs ~150px tall. */
      className="le-noise relative flex min-h-[calc(100svh-170px)] items-center overflow-hidden pb-16 pt-24 lg:pb-20"
    >
      {/* Ambient light only — no grid, no blueprint. */}
      <div className="le-aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="le-container relative grid w-full items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 xl:gap-14">
        {/* ---------------------------- copy ---------------------------- */}
        <div ref={copyRef} className="min-w-0 will-change-[opacity,transform]">
          <Reveal dir="down">
            {/* Colour at rest, not on hover: the eyebrow carries a blue rule
                and blue type from first paint. The Swiss flag sits immediately
                before the label — provenance stated in the first line of the
                page, not buried in the footer. */}
            {/* A size below the `le-kicker` default, and only here. The
                eyebrow sets up the headline; at the shared 10.5px it was
                competing with it, and on a phone the new wording wrapped to
                two full-width lines of tracked-out caps directly above the
                H1. Tightening the tracking with the size keeps it legible
                rather than merely smaller. */}
            <p className="le-kicker flex items-center gap-2.5 text-[9.5px] tracking-[0.16em] sm:text-[10px]">
              <span aria-hidden="true" className="block h-px w-6 bg-accent-bright" />
              <SwissFlag />
              {t.hero.eyebrow}
            </p>
          </Reveal>

          <h1 className="mt-5 text-[clamp(2.05rem,4.2vw,3.05rem)] font-semibold leading-[1.13] tracking-[-0.03em] text-ink lg:mt-6">
            <RevealText
              lines={[...t.hero.h1, t.hero.h1Accent]}
              highlight={2}
              highlightClassName="text-gold-vivid"
              stagger={120}
            />
          </h1>

          <Reveal delay={340}>
            <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-ink-2">{t.hero.sub}</p>
          </Reveal>

          {/* The three trust badges that used to sit here are gone at the
              client's request — the dictionary key went with them. */}
          <Reveal delay={430}>
            <div className="mt-8">
              <PrimaryCta size="md" />
            </div>
          </Reveal>

          {/* ONE trust line, directly under the button. It used to be the
              middle of three ticks a full screen further down, under the
              logo band; the other two were dropped and this one moved here
              so the strongest claim sits where the decision is made rather
              than after it. Small, quiet, and never competing with the CTA —
              it is a footnote to the button, not a second call to action. */}
          <Reveal delay={520}>
            {/* Given real weight at the client's request: white rather than
                the muted grey, a step up in size, semibold, and the mark set
                in a ringed badge instead of floating loose beside the text.
                The badge is what makes it read as a credential rather than as
                a caption — it is the same gold-ringed treatment the site uses
                for its other marks, at the size of the line it sits on. */}
            {/* More air above than a normal stacked element gets: this is a
                separate claim, not a caption on the button, and at mt-6 the
                two read as one block. */}
            {/* NO BADGE ROUND THE MARK, by instruction — the ringed circle
                made a one-line credential look like a feature tile. The mark
                now sits directly beside the words in the accent blue, at the
                cap height of the line it belongs to, which is what a mark
                paired with text is supposed to do. */}
            <p className="mt-8 flex items-center gap-2.5">
              <ShieldCheck
                aria-hidden="true"
                strokeWidth={1.9}
                className="h-[17px] w-[17px] shrink-0 text-accent-bright"
              />
              <span className="text-[14px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink">
                {t.hero.trustLine}
              </span>
            </p>
          </Reveal>
        </div>

        {/* --------------------------- engine ---------------------------
            Bigger than the artwork it replaces, and allowed to bleed past the
            column on wide screens — it is background, so it may run into the
            gutter the way it does in the client's render. */}
        <Reveal dir="scale" delay={200} threshold={0} className="min-w-0">
          {/* On laptops (lg/xl) the engine sits a little lower and runs a
              little larger: at those widths the headline column is tall and
              the engine was optically high against it, reading small and
              floating. Phones and tablets are untouched — there the engine
              stacks under the copy, where neither offset applies. */}
          <div
            ref={engineRef}
            className="mx-auto w-full max-w-[440px] origin-center will-change-transform sm:max-w-[560px] lg:mt-10 lg:max-w-[760px] xl:mt-12 xl:max-w-[840px]"
          >
            <HeroEngine />
          </div>
        </Reveal>
      </div>

    </section>
  );
}
