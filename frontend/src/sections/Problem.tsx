import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Break a headline at sentence boundaries for the masked line reveal. */
function toLines(title: string): string[] {
  const parts = title.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [title];
  const lines = parts.map((p) => p.trim()).filter(Boolean);
  return lines.length ? lines : [title];
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * How far `ref` has travelled across the viewport, 0 → 1. Quantised, so a
 * long scroll costs a couple of dozen renders rather than one per frame.
 * A single rAF-throttled passive listener, torn down on unmount; when it is
 * disabled (reduced motion) it settles on 1 and binds nothing at all.
 */
function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  steps = 24,
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

    /* MEASURES ONLY WHILE THE SECTION IS ANYWHERE NEAR THE SCREEN.

       `getBoundingClientRect()` forces a synchronous layout, and this handler
       was bound to `scroll` unconditionally — so scrolling ANY part of the
       page, including parts thousands of pixels away from this section, paid
       for a layout flush per frame to compute a number that could not have
       changed the render. The observer makes the cost proportional to what is
       actually on screen: away from this section the scroll handler returns
       on a boolean and touches no layout at all.

       The margin is a full viewport on each side, so the progress is already
       correct by the time the section edges into view — gating on strict
       intersection would let it enter mid-animation with a stale value. */
    let near = false;

    /* Cached for the same reason the rect is not: `innerHeight` is stable
       between resizes, and it is read on every measure. */
    let vh = window.innerHeight || 1;

    const measure = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const span = box.height + vh;
      const raw = span > 0 ? (vh - box.top) / span : 0;
      const next = Math.round(clamp01(raw) * steps) / steps;
      if (next !== last) {
        last = next;
        setProgress(next);
      }
    };

    const onScroll = () => {
      if (near && !raf) raf = window.requestAnimationFrame(measure);
    };

    const onResize = () => {
      vh = window.innerHeight || 1;
      onScroll();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) onScroll();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      io.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [ref, enabled, steps]);

  return progress;
}

const PAGE_DOTS = [0, 1, 2, 3, 4, 5];

/**
 * What changed: one question, two worlds — four lines of "then" against four
 * lines of "now", argued row for row, with the arrow between them.
 *
 * MOTION BUDGET — deliberately one idea, after the client asked for "cool but
 * EFFECTIVE animations" instead of decoration:
 *
 *   1. The cards reveal cleanly on entry (the shared `Reveal` / `RevealText`
 *      system: opacity + a short translate, one shot, CSS only).
 *   2. ONE scroll-linked effect: the TODAY card gains presence as it arrives —
 *      its gold edge and glow come up with the section's travel across the
 *      viewport. That is the section's argument made visible: the right-hand
 *      world is the one lighting up. Nothing else is tied to the scroll.
 *
 * Deleted with the client's note: the 3D `rotateY` card pivot, the perspective
 * hinge swing, the per-row rail charges, the pulsing rings on the arrow, the
 * arrow's lean, the veil dimming the BEFORE card and the scroll-driven ambient
 * bloom. The BEFORE card is muted by COLOUR only and is at full contrast from
 * the first frame; nothing here needs a pointer or a hover to be legible.
 */
export default function Problem() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const before = t.problem.before;
  const now = t.problem.now;

  const stageRef = useRef<HTMLDivElement>(null);
  const raw = useScrollProgress(stageRef, !reduced);

  /* The comparison has resolved by the time it sits mid-viewport. */
  const shift = clamp01((raw - 0.14) / 0.44);

  return (
    <section
      id="problem"
      aria-labelledby="problem-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg-alt le-section"
    >
      {/* Static ambient light, centred between the cards. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[46%] h-[520px] w-[900px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--le-gold-rgb) / 0.15), rgb(var(--le-accent-rgb) / 0.18) 48%, transparent 72%)",
          }}
        />
      </div>

      <div className="le-container relative">
        {/* ------------------------------------------------------------ */}
        {/* Head — centred eyebrow, centred headline                      */}
        {/* ------------------------------------------------------------ */}
        <Reveal dir="up">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
            <p className="le-kicker">{t.problem.kicker}</p>
            <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
          </div>
        </Reveal>

        <h2
          id="problem-title"
          className="mx-auto mt-5 max-w-3xl text-center text-[clamp(1.6rem,2.8vw,2.35rem)] font-semibold leading-[1.14] tracking-[-0.025em]"
        >
          <RevealText lines={toLines(t.problem.title)} delay={60} stagger={120} />
        </h2>

        {/* ------------------------------------------------------------ */}
        {/* The comparison — four lines against four lines               */}
        {/* ------------------------------------------------------------ */}
        <div ref={stageRef} className="relative mt-12 lg:mt-16">
          <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-[88px]">
            {/* -------- BEFORE — the dead past. Muted, no accent. ------ */}
            <Reveal dir="up" threshold={0.08} className="h-full">
              <article className="relative flex h-full flex-col rounded-2xl border border-line bg-surface/85 p-5 sm:p-6 lg:p-7">
                <p className="w-fit rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                  {before.label}
                </p>

                <h3 className="mt-4 text-[1.15rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-2 sm:text-[1.3rem]">
                  {before.title}
                </h3>

                <ul className="mt-6 flex-1 space-y-4">
                  {before.rows.map((row) => (
                    <li key={row} className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="block h-[9px] w-[9px] shrink-0 rounded-full border border-ink-3/55"
                      />
                      <span className="min-w-0 break-words text-[13.5px] leading-[1.5] text-ink-2">
                        {row}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex items-center gap-2.5 border-t border-line pt-4">
                  <span className="text-[12px] leading-[1.4] text-ink-3">{before.meta}</span>
                  <span aria-hidden="true" className="flex items-center gap-1.5">
                    {PAGE_DOTS.map((d) => (
                      <span
                        key={d}
                        className={`block h-1 w-1 rounded-full ${
                          d === 0 ? "bg-ink-2" : "bg-ink-3/30"
                        }`}
                      />
                    ))}
                  </span>
                </div>
              </article>
            </Reveal>

            {/* -------- The hinge, stacked: arrow pointing down -------- */}
            <div aria-hidden="true" className="flex justify-center py-1 lg:hidden">
              <Hinge down />
            </div>

            {/* -------- TODAY — the card that gains presence ----------- */}
            <Reveal dir="up" delay={120} threshold={0.08} className="h-full">
              <article
                className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-surface p-5 sm:p-6 lg:p-7"
                style={{
                  borderColor: `rgb(var(--le-gold-rgb) / ${(0.24 + shift * 0.38).toFixed(3)})`,
                  boxShadow: `0 26px 70px -46px rgb(var(--le-gold-rgb) / ${(
                    0.3 +
                    shift * 0.7
                  ).toFixed(3)})`,
                  transition: "border-color 520ms linear, box-shadow 520ms linear",
                }}
              >
                {/* Gold hairline across the top — static structure. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold"
                />

                <p className="w-fit rounded-full border border-gold-deep bg-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-bright">
                  {now.label}
                </p>

                <h3 className="mt-4 text-[1.15rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[1.3rem]">
                  {now.title}
                </h3>

                <ul className="mt-6 flex-1 space-y-4">
                  {now.rows.map((row) => (
                    <li key={row} className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent ring-1 ring-accent-bright/40"
                      >
                        <Check size={11} strokeWidth={3} className="text-hi-strong" />
                      </span>
                      <span className="min-w-0 break-words text-[13.5px] font-medium leading-[1.5] text-ink">
                        {row}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex items-center gap-2.5 border-t border-line pt-4">
                  <span
                    aria-hidden="true"
                    className="block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-bright"
                  />
                  <span className="text-[12px] leading-[1.4] text-gold-bright">{now.meta}</span>
                </div>
              </article>
            </Reveal>
          </div>

          {/* -------- The hinge, side by side: centred between them ---- */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
          >
            <Hinge />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The pivot between the two worlds: a gold disc with an arrow. Structure, not
 * animation — the pulsing rings and the scroll-driven lean are gone.
 */
function Hinge({ down = false }: { down?: boolean }) {
  return (
    <span className="relative flex h-14 w-14 items-center justify-center">
      {/* Reaching hairlines — only meaningful when the cards flank it. */}
      {!down && (
        <>
          <span className="absolute right-full top-1/2 h-px w-4 bg-line-strong" />
          <span className="absolute left-full top-1/2 h-px w-4 bg-gold/70" />
        </>
      )}

      <span
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold-deep bg-bg-alt"
        style={{ boxShadow: "0 0 0 5px rgb(var(--le-gold-rgb) / 0.06)" }}
      >
        <ArrowRight
          size={18}
          strokeWidth={2.2}
          className={`text-gold-bright ${down ? "rotate-90" : ""}`}
        />
      </span>
    </span>
  );
}
