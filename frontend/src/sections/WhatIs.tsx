import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Check } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import ChatMockup from "@/components/ChatMockup";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Break a headline at sentence boundaries for the masked line reveal. */
function toSentences(title: string): string[] {
  const parts = title.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [title];
  const lines = parts.map((p) => p.trim()).filter(Boolean);
  return lines.length ? lines : [title];
}

/**
 * The lead is an authored one-liner (`t.what.lead`). The long `t.what.body`
 * paragraph is deliberately not rendered: the product does the explaining
 * now, and the copy only has to open the door.
 */

/** Legacy separator — kept as a first try so older or future copy that still
 *  uses one keeps working; current copy uses a comma instead (see below). */
const DASH = "–";

/**
 * `t.what.title` is authored as two full sentences ("Wir zeigen Dir nicht nur,
 * ob KI Dich kennt. Wir zeigen Dir, warum sie andere empfiehlt, und ändern
 * das."). The client asked for a much shorter headline and the dictionary is
 * off-limits, so the split happens at runtime:
 *
 *   headline  the LAST sentence — the claim that actually earns display size.
 *   intro     everything before it, kept as a quiet standfirst above the
 *             headline so no authored word is lost.
 *
 * If a language ever ships the title as a single sentence, the en dash is
 * tried instead; if neither separator is present the whole string is rendered
 * as the headline. No language can end up with an empty title.
 */
function splitHeadline(title: string): { intro: string; headline: string } {
  const sentences = toSentences(title);
  if (sentences.length > 1) {
    const last = sentences[sentences.length - 1] ?? "";
    if (last) return { intro: sentences.slice(0, -1).join(" "), headline: last };
  }

  const at = title.indexOf(DASH);
  if (at >= 0) {
    const tail = title.slice(at + DASH.length).trim();
    if (tail) return { intro: title.slice(0, at).trim(), headline: tail };
  }

  return { intro: "", headline: title };
}

/**
 * Puts the closing clause into the warm accent — the promise, not the
 * diagnosis. The copy now sets that clause off with a comma rather than a
 * dash ("…empfiehlt, und ändern das." / "…others, and change that."), so the
 * split point is the LAST comma in the line — both languages phrase this as
 * one comma before the closing "und"/"and", so that comma is always the
 * right place to break. The dash is tried first only so older or future copy
 * that still uses one keeps working. A line with neither renders plainly, so
 * no language can break the headline.
 */
function accentTail(line: string): ReactNode {
  let at = line.indexOf(DASH);
  let sepLen = DASH.length;
  if (at < 0) {
    at = line.lastIndexOf(",");
    sepLen = 1;
  }
  if (at < 0) return line;
  const head = line.slice(0, at + sepLen);
  const tail = line.slice(at + sepLen).trim();
  if (!tail) return line;
  return (
    <>
      {head} <span className="text-gold-bright">{tail}</span>
    </>
  );
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ------------------------------------------------------------------ */
/* Scroll                                                              */
/* ------------------------------------------------------------------ */

/**
 * How far `ref` has travelled across the viewport, 0 → 1. Quantised, so a
 * long scroll costs a couple of dozen renders rather than one per frame.
 * A single rAF-throttled passive listener, torn down on unmount; when it is
 * disabled (reduced motion) it settles on 1 and binds nothing at all.
 */
function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  steps = 32,
): number {
  const [progress, setProgress] = useState(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled) {
      setProgress(1);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let last = -1;

    const measure = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const span = box.height + vh;
      const raw = span > 0 ? (vh - box.top) / span : 0;
      const next = Math.round(clamp01(raw) * steps) / steps;
      if (next !== last) {
        last = next;
        setProgress(next);
      }
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, enabled, steps]);

  return progress;
}

/** The reading line: 76% of the way down the viewport, roughly where the eye
 *  sits while scrolling. */
const READING_LINE = 0.76;

/**
 * Where the reading line currently sits inside `ref`, 0 → 1. Below the
 * element it is 0; once the line has passed the bottom it is 1. Same
 * contract as `useScrollProgress` — quantised, one rAF-throttled passive
 * listener, cleaned up, and it binds nothing when disabled.
 */
function useReadingLine(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  steps = 48,
): number {
  const [at, setAt] = useState(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled) {
      setAt(1);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let last = -1;

    const measure = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      if (box.height <= 0) return;
      const line = (window.innerHeight || 1) * READING_LINE;
      const next = Math.round(clamp01((line - box.top) / box.height) * steps) / steps;
      if (next !== last) {
        last = next;
        setAt(next);
      }
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, enabled, steps]);

  return at;
}

/**
 * What Leads Engine is — shown, not described. The chat mock-up is the whole
 * section: the moment a buyer asks, and an answer names three providers. The
 * copy either side of it is a kicker, a short standfirst, a headline cut down
 * to one sentence (see `splitHeadline`), one opening sentence and the list of
 * what the platform surfaces.
 *
 * Two authored effects live here, both requested by the client and both kept
 * to one job each:
 *
 *   · The check list RESOLVES against a reading line. Each line lifts and
 *     comes up to full contrast as the line 76% down the viewport passes it,
 *     and the gold rail beside the list is that same reading line drawn — it
 *     charges exactly in step. Nothing needs a hover, and a line is always
 *     fully resolved by the time it is anywhere near the middle of the
 *     screen, which is where it is actually read.
 *
 * The mock-up runs on its own (it types, thinks and streams whenever it is on
 * screen) and lifts into place with the section's gold halo as it arrives.
 * Under reduced motion both hooks bind nothing and the section renders in its
 * resolved state.
 */
export default function WhatIs() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();

  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const raw = useScrollProgress(stageRef, !reduced);
  const line = useReadingLine(listRef, !reduced);

  /* Resolved by the time the mock-up sits mid-viewport. */
  const shift = clamp01((raw - 0.16) / 0.42);
  const rest = 1 - shift;

  /* One short sentence for the H2; the setup line above it stays as copy. */
  const { intro, headline } = splitHeadline(t.what.title);
  const checks = t.what.checks;
  /* Each line owns one slot of the list; `1.15` lets it finish resolving a
     little before the reading line has fully cleared it. */
  const slot = 1 / Math.max(1, checks.length);

  return (
    <section
      id="so-funktionierts"
      aria-labelledby="what-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg le-section"
    >
      {/* The section's light sits under the mock-up and comes up with it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[-10%] top-[30%] h-[520px] w-[760px] max-w-[160vw] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--le-accent-rgb) / 0.3), rgb(var(--le-gold-rgb) / 0.1) 50%, transparent 72%)",
            opacity: 0.4 + shift * 0.6,
            transition: "opacity 320ms linear",
          }}
        />
      </div>

      <div className="le-container relative">
        <div className="max-w-3xl">
          <Reveal dir="up">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
              <p className="le-kicker">{t.what.kicker}</p>
            </div>
          </Reveal>

          {/* The standfirst: the sentence the headline used to carry, set
              small and quiet so the H2 below it lands on its own. */}
          {intro && (
            <Reveal dir="up" delay={60}>
              <p className="mt-4 max-w-lg text-[13.5px] leading-[1.6] text-ink-3">{intro}</p>
            </Reveal>
          )}

          <h2
            id="what-title"
            className={`${
              intro ? "mt-3" : "mt-5"
            } text-[clamp(1.7rem,2.9vw,2.5rem)] font-semibold leading-[1.14] tracking-[-0.025em]`}
          >
            <RevealText lines={[accentTail(headline)]} delay={120} />
          </h2>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* The product, and the short list beside it                     */}
        {/* ------------------------------------------------------------ */}
        <div
          ref={stageRef}
          className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:items-start lg:gap-12"
        >
          {/* -------- The mock-up: the centrepiece of the section ------ */}
          <div className="order-1 lg:order-2 lg:col-span-7 lg:-mt-10">
            <Reveal dir="up" threshold={0.08}>
              <div
                style={{
                  transform: `translate3d(0, ${(rest * 10).toFixed(1)}px, 0)`,
                  transition: `transform 520ms ${EASE}`,
                }}
              >
                <div
                  className="relative rounded-[20px] border bg-bg-alt/60 p-2 backdrop-blur-sm sm:p-3"
                  style={{
                    borderColor: `rgb(var(--le-gold-rgb) / ${(0.2 + shift * 0.28).toFixed(3)})`,
                    boxShadow: `0 34px 90px -56px rgb(var(--le-gold-rgb) / ${(
                      0.4 +
                      shift * 0.6
                    ).toFixed(3)})`,
                    transition: "border-color 520ms linear, box-shadow 520ms linear",
                  }}
                >
                  {/* Gold hairline drawing itself across the top of the frame. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gold"
                    style={{
                      transformOrigin: "50% 50%",
                      transform: `scaleX(${(0.25 + shift * 0.75).toFixed(3)})`,
                      transition: `transform 560ms ${EASE}`,
                    }}
                  />
                  <ChatMockup />
                </div>
              </div>
            </Reveal>
          </div>

          {/* -------- What the platform surfaces ---------------------- */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <Reveal dir="up">
              <p className="le-kicker">{t.what.checksTitle}</p>
            </Reveal>

            <div className="relative mt-6 pl-6">
              {/* The rail is the reading line, drawn: the hairline is the
                  whole list, the gold is how much of it has been read. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 left-0 top-1 w-px bg-line-strong"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-1 left-0 top-1 w-px origin-top bg-gold"
                style={{
                  transform: `scaleY(${Math.max(0.02, line).toFixed(3)})`,
                  transition: `transform 420ms ${EASE}`,
                }}
              />

              <ul ref={listRef} className="space-y-3.5">
                {checks.map((check, i) => {
                  /* 0 → 1 as the reading line crosses this line's slot. */
                  const p = clamp01((line - i * slot) / (slot * 1.15));
                  const lit = p > 0.6;
                  return (
                    <li
                      key={check}
                      className="flex items-start gap-3"
                      style={{
                        /* The floor is 0.78, not 0.34. The reading line is a
                           nicety; legibility is not. At 0.34 the last two
                           lines were unreadable until they had been scrolled
                           past, which is the same defect the client flagged
                           when text only resolved on hover. The line still
                           lifts and brightens — just never out of legibility. */
                        opacity: 0.78 + p * 0.22,
                        transform: `translate3d(0, ${((1 - p) * 8).toFixed(1)}px, 0)`,
                        transition: `opacity 420ms ${EASE}, transform 420ms ${EASE}`,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border bg-bg-alt"
                        style={{
                          borderColor: lit
                            ? "rgb(var(--le-gold-rgb) / 0.85)"
                            : "rgb(var(--le-accent-bright-rgb) / 0.5)",
                          boxShadow: lit
                            ? "0 0 18px -6px var(--le-gold-glow)"
                            : "0 0 0 0 transparent",
                          transition: `border-color 460ms ${EASE}, box-shadow 460ms ${EASE}`,
                        }}
                      >
                        <Check
                          size={11}
                          strokeWidth={3}
                          className={lit ? "text-gold-bright" : "text-accent-bright"}
                        />
                      </span>
                      <span className="min-w-0 break-words text-[15px] leading-[1.6] text-ink-2">
                        {check}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Reveal dir="up" delay={120}>
              <ul className="mt-8 flex flex-wrap gap-2">
                {t.what.badges.map((badge) => (
                  <li
                    key={badge}
                    className="flex items-center gap-2 rounded-full border border-gold-deep bg-gold/[0.07] px-3 py-1.5 text-[11.5px] leading-[1.5] text-ink-2 transition-colors duration-300 hover:border-gold hover:text-ink"
                  >
                    <span
                      aria-hidden="true"
                      className="block h-1 w-1 shrink-0 rounded-full bg-gold-bright"
                    />
                    <span className="min-w-0 break-words">{badge}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* The lead sentence closes the column rather than opening the
                section — the client asked for it to sit under the list and the
                badges. It still types itself into a box it has already
                reserved, so nothing below it moves. */}
            {/* Plain text. The typing effect was removed at the client's
                request — the sentence is a closing statement, not a demo. */}
            <p className="mt-8 max-w-xl border-t border-line pt-6 text-[15px] leading-[1.65] text-ink-2">
              {t.what.lead}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
