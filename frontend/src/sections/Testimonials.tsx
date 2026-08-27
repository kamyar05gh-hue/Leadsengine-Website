import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Stimmen — the quotes are wrapped around a horizontal drum that turns by
 * itself, at a constant, calm speed. Nothing here is driven by the scroll.
 *
 * GEOMETRY. The drum rotates about the X axis. Its rows are laid out as a
 * closed ring: `rowCount = items.length * REPEATS` rows, each at
 * `rotateX(i * step) translateZ(radius)`, with `step = 360 / rowCount`. The
 * ring is therefore complete by construction — there is no first row and no
 * last row, so the loop has no seam to hide. Because a duplicate of any row
 * recurs every `items.length` rows, `REPEATS` is what sets how far apart the
 * two copies sit: at three repeats they are 120° apart, so by the time one
 * copy has reached the edge of the lit window its twin is already past the
 * vanishing point. Only the outermost pair can ever coincide, and the falloff
 * below leaves it at a quarter opacity, behind the vignette.
 *
 * FRONT ROW AT 1:1. The drum carries `translateZ(-radius) rotateX(θ)`. Reading
 * right to left: the ring turns, then the whole ring is pushed back by its own
 * radius, which lands the front row exactly on z = 0. The row facing the
 * viewer is therefore un-scaled and un-foreshortened; every other row is
 * compressed and pushed away purely by the transform, never faked.
 *
 * LIGHT. Each frame writes one opacity per row from `cos(θ_row)`: 1.0 at the
 * front, ~0.75 one row out, ~0.27 at the edge of the window, 0 once a row
 * turns past 90°. The curve is deliberately steep so the outer rows read as
 * depth rather than as competing copy. Two static gradient overlays close the
 * vignette at the stage edges — the lower one is taller and heavier, so the
 * drum darkens into the ground.
 *
 * MOTION. One rAF advances the angle by `DEG_PER_SEC` of wall-clock time —
 * frame-rate independent, and the per-frame delta is capped so a backgrounded
 * tab cannot return with a jump. `useInView({ once: false })` gates the loop:
 * the drum turns only while the section is on screen and the rAF is cancelled
 * the moment it leaves, so nothing runs down the rest of the page. The angle
 * lives in a ref, so leaving and returning resumes rather than restarts.
 *
 * RESPONSIVE. Row height, radius, perspective and both type sizes are derived
 * from the measured stage width by `computeGeo`, re-measured through a
 * `ResizeObserver` on the stage itself (the section can be narrower than the
 * window). Nothing is hard-coded to a breakpoint.
 *
 * REDUCED MOTION. No drum, no observer, no rAF: the four quotes render as a
 * plain vertical list at full contrast.
 *
 * ACCESSIBILITY. The rows are decorative duplication, so the whole stage is
 * `aria-hidden` and one visually hidden list carries each voice exactly once.
 */

/** Leading/trailing quote glyphs the source copy may already carry. */
const EDGE_QUOTES = /^["«„“]+|["»“”]+$/g;

/** Full turns of the quote set wrapped around the drum. */
const REPEATS = 3;
/** Idle rotation speed. 5.5°/s ≈ one row every 5.5 seconds — readable. */
const DEG_PER_SEC = 5.5;
/** Frame delta ceiling, so a restored background tab never jumps. */
const MAX_FRAME_MS = 64;
/** Perspective as a multiple of the radius. Low = wide angle = more depth. */
const PERSPECTIVE_RATIO = 2.9;
/** Share of its angular slot a row occupies; < 1 leaves air between rows. */
const SLOT_FILL = 0.8;
/** Visible slice of the drum, as a multiple of its radius. Taller = more rows. */
const STAGE_RATIO = 1.78;
/** Opacity of a row seen edge-on, before the vignette darkens it further. */
const DIM_FLOOR = 0.07;
/** Falloff exponent on cos(θ). Higher = the front row carries more weight. */
const DIM_CURVE = 2.2;

const DRUM_STYLES = `
.le-drum-row {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.le-drum-quote {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.le-drum-meta {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}`;

/** One five-star rating: a single small SVG, five copies of the same path. */
const STAR_D =
  "M8 1.2l2.06 4.18 4.61.67-3.34 3.25.79 4.6L8 11.72 3.88 13.9l.79-4.6L1.33 6.05l4.61-.67z";

function Stars({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 16"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={`h-3 w-[66px] shrink-0 text-gold-vivid ${className}`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={STAR_D} transform={`translate(${i * 18} 0)`} />
      ))}
    </svg>
  );
}

type Geo = {
  rowH: number;
  radius: number;
  perspective: number;
  quoteFs: number;
  metaFs: number;
  stageH: number;
};

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Everything the drum needs, from one number. `radius` is the value at which
 * `rowH` covers `SLOT_FILL` of its angular slot, so rows never overlap and the
 * gap between them stays constant at every width.
 */
function computeGeo(width: number, step: number): Geo {
  const w = clamp(280, width, 1600);
  const rowH = Math.round(clamp(124, w * 0.124, 166));
  const radius = Math.round(rowH / (2 * Math.tan((step / 2) * (Math.PI / 180)) * SLOT_FILL));
  const quoteFs = Math.round(clamp(17, w * 0.0225, 27.5) * 10) / 10;

  return {
    rowH,
    radius,
    perspective: Math.round(radius * PERSPECTIVE_RATIO),
    quoteFs,
    metaFs: Math.round(clamp(10.5, quoteFs * 0.6, 13.5) * 10) / 10,
    stageH: Math.round(radius * STAGE_RATIO + rowH),
  };
}

type Item = { quote: string; name: string; role: string };

function clean(quote: string): string {
  return quote.replace(EDGE_QUOTES, "").trim();
}

export default function Testimonials() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();

  const items: readonly Item[] = t.testimonials.items;
  const count = items.length;
  const rowCount = count * REPEATS;
  const step = 360 / rowCount;

  const stageRef = useRef<HTMLDivElement>(null);
  const drumRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  /** Painted angle, kept across pauses so the drum resumes where it stopped. */
  const angleRef = useRef(0);

  /* The drum turns only while it is on screen. */
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({
    threshold: 0,
    rootMargin: "0px",
    once: false,
  });

  const [geo, setGeo] = useState<Geo>(() =>
    computeGeo(typeof window === "undefined" ? 1100 : Math.min(window.innerWidth - 40, 1100), step),
  );

  /* ---------------------------------------------------------------- */
  /* Measure — the stage, not the window.                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;

    const measure = () => {
      raf = 0;
      const w = stage.clientWidth;
      if (!w) return;
      const next = computeGeo(w, step);
      setGeo((prev) => (prev.rowH === next.rowH && prev.quoteFs === next.quoteFs ? prev : next));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(stage);

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced, step]);

  /* ---------------------------------------------------------------- */
  /* Turn — one rAF, constant speed, paused off-screen.                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (reduced) return;
    const drum = drumRef.current;
    if (!drum) return;

    const rows = rowsRef.current;
    const back = -geo.radius;

    const paint = (angle: number) => {
      drum.style.transform = `translateZ(${back}px) rotateX(${angle.toFixed(3)}deg)`;

      for (let i = 0; i < rowCount; i += 1) {
        const el = rows[i];
        if (!el) continue;
        // How far this row's face has turned away from the viewer.
        const face = Math.cos(((i * step + angle) * Math.PI) / 180);
        el.style.opacity =
          face <= 0.02
            ? "0"
            : (DIM_FLOOR + (1 - DIM_FLOOR) * Math.pow(face, DIM_CURVE)).toFixed(3);
      }
    };

    // Always land the current angle, even while paused: a resize re-runs this
    // effect and the drum must be painted for the new geometry.
    paint(angleRef.current);
    if (!inView) return;

    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = last === 0 ? 0 : Math.min(now - last, MAX_FRAME_MS);
      last = now;
      angleRef.current = (angleRef.current + (dt / 1000) * DEG_PER_SEC) % 360;
      paint(angleRef.current);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [reduced, inView, geo.radius, rowCount, step]);

  /* ---------------------------------------------------------------- */

  const head = (
    <div className="relative mx-auto max-w-2xl text-center">
      <Reveal>
        <div className="flex items-center justify-center gap-3">
          <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
          <p className="le-kicker">{t.testimonials.kicker}</p>
          <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
        </div>
      </Reveal>

      <Reveal delay={80}>
        <h2
          id="stimmen-title"
          className="mt-5 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-ink"
        >
          {t.testimonials.title}
        </h2>
      </Reveal>
    </div>
  );

  /* The bottom padding is asymmetric on purpose. The drum already ends in a
     heavy bottom vignette that reads as ~90px of empty space, so a symmetrical
     `py-28` stacked on the next section's `pt-28` left a visible hole. The
     bottom is cut well below half; the top is untouched.
     Tightened twice more at the client's request. The TOP padding is now zero:
     the section above already ends in its own full `le-section` bottom
     padding, so this section's top padding was pure doubling and left a gap
     nothing filled. The bottom is cut again below that.
     Plain `pt-*`/`pb-*` utilities are enough to win over `le-section`, which
     lives in Tailwind's components layer — utilities are emitted after it. */
  return (
    <section
      id="stimmen"
      aria-labelledby="stimmen-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg le-section pb-[clamp(1rem,2vw,1.75rem)] pt-0"
    >
      {/* The one ambient glow in this section — gold over blue. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] max-w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(var(--le-gold-rgb) / 0.13), rgb(var(--le-accent-rgb) / 0.18) 48%, transparent 72%)",
        }}
      />

      <div className="le-container relative">
        {head}

        {reduced ? (
          /* ---------------------------------------------------------- */
          /* Reduced motion: a plain, fully legible list. No drum, no    */
          /* observers, no rAF — the effects above return before they    */
          /* touch anything.                                             */
          /* ---------------------------------------------------------- */
          <ul className="mx-auto mt-12 max-w-2xl list-none divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.name} className="py-6">
                <figure>
                  <Stars />
                  <blockquote className="mt-2.5 text-[clamp(1.05rem,2.1vw,1.35rem)] font-medium italic leading-[1.4] tracking-[-0.015em] text-ink">
                    {clean(item.quote)}
                  </blockquote>
                  <figcaption className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="text-[13px] font-semibold text-ink">{item.name}</span>
                    <span aria-hidden="true" className="text-[12px] text-ink-3">
                      ·
                    </span>
                    <span className="text-[12.5px] leading-snug text-ink-2">{item.role}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <div ref={viewRef}>
            <style>{DRUM_STYLES}</style>

            {/* The one accessible copy of the voices. The drum below repeats
                every quote four times, so it is hidden from assistive tech
                entirely and this list carries the content. */}
            <ul className="sr-only">
              {items.map((item) => (
                <li key={item.name}>
                  <figure>
                    <blockquote>{clean(item.quote)}</blockquote>
                    <figcaption>
                      {item.name}
                      {" — "}
                      {item.role}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>

            {/* ------------------------------------------------------- */}
            {/* The drum                                                */}
            {/* ------------------------------------------------------- */}
            <div
              ref={stageRef}
              aria-hidden="true"
              /* Tightened twice at the client's request, now to nothing. The
                 drum's own vignette already fades ~32% of its height at the
                 top into the ground, so ANY margin here stacks on top of that
                 fade and reads as a hole between the headline and the quotes
                 — the fade IS the spacing. Was `mt-10 lg:mt-14`, then
                 `mt-5 lg:mt-7`. */
              className="relative select-none overflow-hidden"
              style={{ height: `${geo.stageH}px` }}
            >
              {/* Perspective lives on its own element so the clipping above
                  never has to share a containing block with it. */}
              <div
                className="absolute inset-0"
                style={{ perspective: `${geo.perspective}px`, perspectiveOrigin: "50% 50%" }}
              >
                <div
                  ref={drumRef}
                  className="absolute inset-0"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: `translateZ(${-geo.radius}px) rotateX(0deg)`,
                    willChange: "transform",
                  }}
                >
                  {Array.from({ length: rowCount }, (_, i) => {
                    // Rows are read in descending index as the drum turns
                    // forward, so the item index is mirrored to keep the
                    // running order 1 → 2 → 3 → 4 → 1.
                    const item = items[(rowCount - i) % count];
                    return (
                      <div
                        key={`${item.name}-${i}`}
                        ref={(el) => {
                          rowsRef.current[i] = el;
                        }}
                        className="le-drum-row absolute left-0 right-0 flex items-center justify-center overflow-hidden px-4 text-center sm:px-8"
                        style={{
                          top: "50%",
                          height: `${geo.rowH}px`,
                          marginTop: `${-geo.rowH / 2}px`,
                          transform: `rotateX(${i * step}deg) translateZ(${geo.radius}px)`,
                          opacity: i === 0 ? 1 : 0,
                        }}
                      >
                        <div className="w-full">
                          <Stars className="mx-auto" />
                          <p
                            className="le-drum-quote mt-2 text-pretty font-medium italic tracking-[-0.015em] text-ink"
                            style={{
                              fontSize: `${geo.quoteFs}px`,
                              lineHeight: 1.34,
                            }}
                          >
                            {clean(item.quote)}
                          </p>
                          <p
                            className="le-drum-meta mt-1.5 text-ink-2"
                            style={{ fontSize: `${geo.metaFs}px`, lineHeight: 1.3 }}
                          >
                            <span className="font-semibold text-ink">{item.name}</span>
                            <span className="text-ink-3">{" · "}</span>
                            {item.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vignette. Static gradients, never animated.
                  All FOUR edges fade now: with only top and bottom the drum
                  read as a separate panel dropped into the section. Fading the
                  sides as well makes it dissolve into the ground on every
                  edge, so it belongs to the section it sits in. */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-[16%]"
                style={{
                  background:
                    "linear-gradient(to right, var(--le-bg) 0%, rgb(var(--le-bg-rgb) / 0.55) 52%, transparent 100%)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[16%]"
                style={{
                  background:
                    "linear-gradient(to left, var(--le-bg) 0%, rgb(var(--le-bg-rgb) / 0.55) 52%, transparent 100%)",
                }}
              />
              {/* The TOP fade is shallower than the bottom one (was 32%).
                  It sits directly under the headline, so every percent of it
                  reads as empty space between the two; the bottom fade has no
                  such neighbour and keeps its depth. */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[20%]"
                style={{
                  background:
                    "linear-gradient(to bottom, var(--le-bg) 0%, rgb(var(--le-bg-rgb) / 0.8) 46%, transparent 100%)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]"
                style={{
                  background:
                    "linear-gradient(to top, var(--le-bg) 0%, rgb(var(--le-bg-rgb) / 0.86) 42%, transparent 100%)",
                }}
              />

              {/* The reading line — two short gold ticks marking the one row
                  that is at full size and full brightness. */}
              <span className="pointer-events-none absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-gold sm:w-8" />
              <span className="pointer-events-none absolute right-0 top-1/2 h-px w-5 -translate-y-1/2 bg-gold sm:w-8" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
