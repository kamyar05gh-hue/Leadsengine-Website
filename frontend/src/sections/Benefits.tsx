import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/*
 * "Mehr Sichtbarkeit. Mehr Anfragen. Mehr Umsatz."
 *
 * The brief was blunt: less text, more visuals and icons — and no overlaps.
 * So the five benefits are now ICON-LED. Each one is a drawn mark plus its
 * title; the long body sentences are not rendered at all. Nothing in here is a
 * paragraph.
 *
 * WHY IT CANNOT OVERLAP
 * The previous version plotted the benefits as stations on an axis with
 * absolutely-positioned frames inside a fixed-height plot. That construction
 * collides the moment German runs a line longer than English — and it did.
 * It is gone. What replaces it:
 *
 *   · one CSS grid, `grid-cols-1 / sm:2 / md:3 / lg:5`, with a real `gap`.
 *     Grid tracks cannot overlap each other, and a gap cannot be crossed.
 *   · inside every cell, flex + normal flow only — a row on mobile (icon, then
 *     words), a column from `sm` up (icon, then words). Flex items are laid
 *     out side by side or stacked; they cannot land on one another.
 *   · no `position: absolute` on anything that carries text; no fixed heights,
 *     no `translate` used for placement; `min-w-0` + `break-words` on the text
 *     column so a long German compound wraps instead of pushing the track.
 *     A longer string simply makes its row taller and takes every sibling
 *     with it.
 *
 * The only absolutely-positioned element left is the section's background
 * wash, which is aria-hidden, pointer-events-none and behind everything.
 *
 * MOTION — one idea, once. A single observer releases the five cells in order.
 * No axis to draw, no riser, no spark, no loop, nothing that re-triggers.
 */

/** A shape on the 24×24 icon grid. `gold` marks the one detail that carries the point. */
type Shape =
  | { k: "p"; d: string; gold?: boolean; w?: number; fill?: boolean }
  | { k: "c"; cx: number; cy: number; r: number; gold?: boolean; w?: number; fill?: boolean }
  | { k: "r"; x: number; y: number; rw: number; rh: number; rx: number; gold?: boolean; w?: number };

/**
 * Five marks, drawn here rather than imported, so each one says its own
 * benefit instead of being a generic glyph:
 *
 *   01 an answer bubble in which one line — yours — is gold
 *   02 a gauge whose gold needle is actually pointing at something
 *   03 a magnifier with the gold AI spark that sits beyond it
 *   04 a cycle that closes, with a gold rise inside it
 *   05 a shield carrying the gold Swiss cross
 *
 * Deliberately distinct from the six in FeatureShowcase — no second crosshair,
 * no second bar chart, no second map pin.
 */
const ICONS: readonly Shape[][] = [
  /* 01 — Im Kaufmoment sichtbar: the answer, with your mention lit in gold. */
  [
    { k: "r", x: 3, y: 4.2, rw: 18, rh: 12.8, rx: 3.4 },
    { k: "p", d: "M8.4 16.6 H12.2 L8.4 20.6 Z", fill: true },
    { k: "p", d: "M6.9 8.9 H17.1" },
    { k: "p", d: "M6.9 12.6 H12.3" },
    { k: "p", d: "M14.3 12.6 H17.1", gold: true, w: 2.1 },
  ],

  /* 02 — Messbar & transparent: a dial that reads, not a decoration. */
  [
    { k: "p", d: "M3.6 18.4 A8.4 8.4 0 0 1 20.4 18.4" },
    { k: "p", d: "M6.1 12.5 L7.3 13.7" },
    { k: "p", d: "M12 10.1 V11.8" },
    { k: "p", d: "M17.9 12.5 L16.7 13.7" },
    { k: "p", d: "M12 18.4 L16.9 13.5", gold: true, w: 2.1 },
    { k: "c", cx: 12, cy: 18.4, r: 1.35, gold: true, fill: true },
  ],

  /* 03 — Mehr als SEO: the search, and the gold spark that lies past it. */
  [
    { k: "c", cx: 9.8, cy: 9.8, r: 5.8 },
    { k: "p", d: "M14 14 L19.6 19.6", w: 1.9 },
    {
      k: "p",
      d: "M18.6 2.6 L19.65 4.55 L21.6 5.6 L19.65 6.65 L18.6 8.6 L17.55 6.65 L15.6 5.6 L17.55 4.55 Z",
      gold: true,
      w: 1.5,
    },
  ],

  /* 04 — Kontinuierlich besser: the loop, and what the loop is for. */
  [
    { k: "p", d: "M20.4 12 A8.4 8.4 0 1 1 12 3.6 C14.35 3.6 16.6 4.53 18.29 6.16 L20.4 8.26" },
    { k: "p", d: "M20.4 3.8 V8.26 H16" },
    { k: "p", d: "M12 15.6 V9.4", gold: true, w: 2.1 },
    { k: "p", d: "M9.4 12 L12 9.4 L14.6 12", gold: true, w: 2.1 },
  ],

  /* 05 — Aus der Schweiz: a shield, because the point is where the data stays. */
  [
    {
      k: "p",
      d: "M12 2.9 L19.6 5.9 V11.6 C19.6 16.4 16.4 19.7 12 21.1 C7.6 19.7 4.4 16.4 4.4 11.6 V5.9 Z",
    },
    { k: "p", d: "M12 8.6 V14.6", gold: true, w: 2.1 },
    { k: "p", d: "M9 11.6 H15", gold: true, w: 2.1 },
  ],

  /* 06 — Ein fester Ansprechpartner: one person, and the gold dot that says
     they are actually reachable. */
  [
    { k: "c", cx: 12, cy: 8.1, r: 3.7 },
    { k: "p", d: "M4.9 20.2 C4.9 16.3 8.1 14.1 12 14.1 C15.9 14.1 19.1 16.3 19.1 20.2" },
    { k: "c", cx: 18.6, cy: 6.2, r: 2.1, gold: true, fill: true },
  ],
];

/** One mark, painted whole on the first frame. No draw-on, no dash, no loop. */
function Icon({ shapes }: { shapes: readonly Shape[] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="block text-accent-bright"
    >
      {shapes.map((shape, i) => {
        const paint = shape.gold ? "var(--le-gold-bright)" : "currentColor";

        if (shape.k === "c") {
          return shape.fill ? (
            <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill={paint} />
          ) : (
            <circle
              key={i}
              cx={shape.cx}
              cy={shape.cy}
              r={shape.r}
              stroke={paint}
              strokeWidth={shape.w ?? 1.55}
            />
          );
        }

        if (shape.k === "r") {
          return (
            <rect
              key={i}
              x={shape.x}
              y={shape.y}
              width={shape.rw}
              height={shape.rh}
              rx={shape.rx}
              stroke={paint}
              strokeWidth={shape.w ?? 1.55}
            />
          );
        }

        return shape.fill ? (
          <path key={i} d={shape.d} fill={paint} />
        ) : (
          <path
            key={i}
            d={shape.d}
            stroke={paint}
            strokeWidth={shape.w ?? 1.55}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

/** Break the headline at its sentence boundaries — three "Mehr …" lines. */
function toLines(title: string): string[] {
  const parts = title.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [title];
  const lines = parts.map((p) => p.trim()).filter(Boolean);
  return lines.length ? lines : [title];
}

export default function Benefits() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const items = t.benefits.items;

  const { ref: gridRef, inView } = useInView<HTMLUListElement>({ threshold: 0.1 });
  const on = reduced || inView;

  return (
    <section
      id="vorteile"
      aria-labelledby="benefits-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg le-section"
    >
      {/* One warm light source. Static — it sets temperature, it does not perform. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/4 h-[520px] w-[760px] max-w-[130vw] translate-x-1/3"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(var(--le-gold-rgb) / 0.09), transparent 68%)",
        }}
      />

      <div className="le-container relative">
        <div className="max-w-2xl">
          <Reveal dir="up">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
              <p className="le-kicker">{t.benefits.kicker}</p>
            </div>
          </Reveal>

          <h2
            id="benefits-title"
            className="mt-6 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.14] tracking-[-0.025em]"
          >
            <RevealText lines={toLines(t.benefits.title)} delay={60} stagger={110} />
          </h2>
        </div>

        {/* Five cells. Grid tracks + block flow — collision-proof by construction. */}
        <ul
          ref={gridRef}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6"
        >
          {items.map((item, i) => (
            <li
              key={item.title}
              /* Same card language as "Was sich verändert hat": a bordered
                 surface panel, a small uppercase pill at the top, the title
                 under it and the body beneath — at the client's request the
                 two sections now read as one family. The staircase that used
                 to live here is gone with it. */
              className="group flex min-w-0 flex-col rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur-sm transition-[border-color] duration-500 hover:border-accent-bright/45 sm:p-6 lg:p-7"
              style={{
                opacity: on ? 1 : 0,
                transform: on ? "none" : "translateY(18px)",
                transition: `opacity 620ms var(--le-ease-out) ${i * 90}ms, transform 620ms var(--le-ease-out) ${i * 90}ms, border-color 500ms`,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="le-mono w-fit rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <span
                  aria-hidden="true"
                  className="shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5"
                >
                  <Icon shapes={ICONS[i] ?? ICONS[0]} />
                </span>
              </div>

              <h3 className="mt-5 hyphens-auto break-words text-[1.05rem] font-semibold leading-[1.25] tracking-[-0.02em] text-ink sm:text-[1.15rem]">
                {item.title}
              </h3>

              {/* The body was authored and then never rendered — the cells were
                  a title and an icon, which is why the section read as flat. */}
              <p className="mt-3 flex-1 text-[13.5px] leading-[1.65] text-ink-2">{item.body}</p>

              <span
                aria-hidden="true"
                className="mt-6 block h-px w-full origin-left bg-accent-bright/45"
                style={{
                  transform: on ? "scaleX(1)" : "scaleX(0)",
                  transition: `transform 760ms var(--le-ease-out) ${260 + i * 90}ms`,
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
