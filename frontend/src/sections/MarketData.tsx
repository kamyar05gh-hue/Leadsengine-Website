import type { ReactNode } from "react";
import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import Counter from "@/components/Counter";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Der Markt — the data-and-numbers section.
 *
 * Four quiet panels in a 2×2 grid (one column on a phone), each carrying a
 * title, a grey meta line and exactly one chart: AI adoption as columns, where
 * B2B research starts as horizontal bars, which engines get asked as a donut
 * with the leading share in the hole, and the shortlist length as a single
 * figure. Every mark is inline SVG — no chart library — and every chart is
 * drawn once as it enters, by transitioning `stroke-dashoffset` on a path
 * normalised with `pathLength="1"`, plus transform/opacity on the labels.
 *
 * TYPE SCALE. The client asked twice for the numbers to come down, so this
 * section is deliberately set as a dense instrument panel rather than a set of
 * billboards: the two headline figures cap at 2rem
 * (`clamp(1.5rem, 2.2vw, 2rem)`) and every in-chart label sits at 10–11px.
 * The share in the donut's hole is not a headline figure at all — it caps at
 * 1.25rem, below the two that are, so the ring reads as the mark and the
 * number as its label. Nothing here competes with the section headline.
 *
 * COLOUR. Every figure and every mark is blue — `accent-bright` leads, the two
 * lighter steels follow, neutral grey takes the tail. Gold survives in exactly
 * two decorative places, the kicker and the panel hairline, so the section is
 * still warm at its edges while the data itself reads as one cool instrument.
 * Adjacent series always differ in value as well as hue, and every figure is
 * printed as text — the chart never carries meaning by colour alone.
 *
 * Accessibility: each chart block is one `role="img"` with an aria-label built
 * from the same numbers, so its internals are announced once, not twice.
 */

/* Series palette. Blue leads and the tail cools into neutrals, so every pair of
   neighbours differs in hue *and* in value — the ranking survives a greyscale
   print, and no entry is set in a tint too faint to read as a label. */
const SERIES = [
  "var(--le-accent-bright)",
  "var(--le-hi-strong)",
  "var(--le-ink-2)",
  "var(--le-ink-3)",
  "var(--le-accent)",
];

/* Every headline figure in this section shares one size. */
const FIGURE = "text-[clamp(1.5rem,2.2vw,2rem)]";

/** Nominal drawing width for every scaling chart, in viewBox units. */
const VB_W = 320;

/** Break a headline at sentence boundaries for the masked line reveal. */
function toLines(title: string): string[] {
  const parts = title.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [title];
  const lines = parts.map((p) => p.trim()).filter(Boolean);
  return lines.length ? lines : [title];
}

type Slice = { label: string; share: number };

/* ------------------------------------------------------------------ */

function Panel({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur-md sm:p-6 lg:p-7">
      {/* Permanent gold hairline — the panel is warm at rest, not on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--le-gold-rgb) / 0.55), transparent)",
        }}
      />
      <h3 className="text-[13.5px] font-semibold leading-snug tracking-[-0.015em] text-ink">
        {title}
      </h3>
      <p className="mt-1 text-[11px] leading-[1.5] text-ink-3">{meta}</p>
      {children}
    </article>
  );
}

/* ---------------------------- 1 · columns --------------------------- */

function AdoptionChart({
  years,
  values,
  unit,
  note,
}: {
  years: string[];
  values: number[];
  unit: string;
  note: string;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const on = reduced || inView;

  const count = Math.max(1, values.length);
  const peak = Math.max(...values, 1) * 1.08;
  const base = 104;
  const band = 92;
  const slot = VB_W / count;
  const barW = Math.min(36, slot * 0.56);

  const label = years.map((y, i) => `${y}: ${values[i]}${unit}`).join(", ");

  return (
    <div ref={ref} className="mt-5 flex flex-1 flex-col justify-end">
      <div role="img" aria-label={label}>
        <svg viewBox={`0 0 ${VB_W} 112`} className="block h-auto w-full">
          {values.map((v, i) => {
            const cx = slot * (i + 0.5);
            const h = Math.max(2, (v / peak) * band);
            const last = i === values.length - 1;
            return (
              /* The last column is the highlight: full-strength accent-bright
                 against a rising ramp of translucent blue, and the only one
                 with a cap line above it. */
              <g key={years[i]}>
                <line
                  x1={cx}
                  y1={base}
                  x2={cx}
                  y2={base - h}
                  stroke={
                    last
                      ? "var(--le-accent-bright)"
                      : `rgb(var(--le-accent-bright-rgb) / ${0.34 + i * 0.1})`
                  }
                  strokeWidth={barW}
                  strokeLinecap="butt"
                  pathLength={1}
                  strokeDasharray={1}
                  style={{
                    strokeDashoffset: on ? 0 : 1,
                    transition: `stroke-dashoffset 900ms var(--le-ease-out) ${140 + i * 90}ms`,
                  }}
                />
                {last && (
                  <line
                    x1={cx - barW / 2}
                    y1={base - h - 4}
                    x2={cx + barW / 2}
                    y2={base - h - 4}
                    stroke="var(--le-accent-bright)"
                    strokeWidth={2}
                    strokeLinecap="butt"
                    pathLength={1}
                    strokeDasharray={1}
                    style={{
                      strokeDashoffset: on ? 0 : 1,
                      transition: `stroke-dashoffset 600ms var(--le-ease-out) ${
                        520 + i * 90
                      }ms`,
                    }}
                  />
                )}
              </g>
            );
          })}

          <line
            x1="0"
            y1={base + 0.5}
            x2={VB_W}
            y2={base + 0.5}
            stroke="var(--le-line-strong)"
            strokeWidth="1"
          />
        </svg>

        {/* Value + year sit on the same 5-track grid as the columns, so the
            readout stays crisp type at every card width. */}
        <div className="mt-3 grid grid-cols-5 gap-1">
          {years.map((y, i) => {
            const last = i === years.length - 1;
            return (
              <div
                key={y}
                className="text-center"
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? "none" : "translateY(6px)",
                  transition: `opacity 560ms var(--le-ease-out) ${420 + i * 80}ms, transform 560ms var(--le-ease-out) ${
                    420 + i * 80
                  }ms`,
                }}
              >
                <div
                  className={`le-mono text-[11px] font-semibold leading-none ${
                    last ? "text-accent-bright" : "text-ink-2"
                  }`}
                >
                  {values[i]}
                  {unit}
                </div>
                <div className="mt-1 text-[10px] leading-none tracking-[0.05em] text-ink-3">
                  {y}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 text-[11.5px] font-medium leading-[1.5] text-accent-bright">
        <span
          aria-hidden="true"
          className="mt-[4px] block h-0 w-0 shrink-0 border-x-[4px] border-b-[6px] border-x-transparent border-b-accent-bright"
        />
        {note}
      </p>
    </div>
  );
}

/* ------------------------- 2 · horizontal bars ---------------------- */

function SplitChart({ items }: { items: readonly Slice[] }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const on = reduced || inView;

  const total = items.reduce((sum, it) => sum + it.share, 0) || 1;
  const label = items.map((it) => `${it.label}: ${it.share}%`).join(", ");

  const THICK = 9;
  const inset = THICK / 2;
  const track = VB_W - THICK;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className="mt-6 flex flex-1 flex-col justify-center gap-5"
    >
      {items.map((it, i) => {
        const width = (it.share / total) * track;
        return (
          <div key={it.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[11.5px] leading-tight text-ink-2">{it.label}</span>
              <span
                className="le-mono shrink-0 text-[11px] font-semibold leading-none"
                style={{
                  color: SERIES[i % SERIES.length],
                  opacity: on ? 1 : 0,
                  transform: on ? "none" : "translateY(4px)",
                  transition: `opacity 520ms var(--le-ease-out) ${
                    320 + i * 130
                  }ms, transform 520ms var(--le-ease-out) ${320 + i * 130}ms`,
                }}
              >
                {it.share}%
              </span>
            </div>

            <svg
              viewBox={`0 0 ${VB_W} ${THICK}`}
              className="mt-2 block h-auto w-full"
              aria-hidden="true"
            >
              <line
                x1={inset}
                y1={THICK / 2}
                x2={VB_W - inset}
                y2={THICK / 2}
                stroke="var(--le-line)"
                strokeWidth={THICK}
                strokeLinecap="round"
              />
              <line
                x1={inset}
                y1={THICK / 2}
                x2={inset + width}
                y2={THICK / 2}
                stroke={SERIES[i % SERIES.length]}
                strokeWidth={THICK}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                style={{
                  strokeDashoffset: on ? 0 : 1,
                  transition: `stroke-dashoffset 1000ms var(--le-ease-out) ${120 + i * 130}ms`,
                }}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- 3 · donut ---------------------------- */

const D_C = 60;
const D_R = 45;
const D_GAP = 3;

function polar(deg: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: D_C + D_R * Math.cos(rad), y: D_C + D_R * Math.sin(rad) };
}

function arcPath(from: number, to: number): string {
  const a = polar(from);
  const b = polar(to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${D_R} ${D_R} 0 ${large} 1 ${b.x.toFixed(
    2,
  )} ${b.y.toFixed(2)}`;
}

function EnginesChart({ items }: { items: readonly Slice[] }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const on = reduced || inView;

  const total = items.reduce((sum, it) => sum + it.share, 0) || 1;
  const lead = items[0];
  const label = items.map((it) => `${it.label}: ${it.share}%`).join(", ");

  let cursor = 0;
  const arcs = items.map((it, i) => {
    const sweep = (it.share / total) * 360;
    const from = cursor + D_GAP / 2;
    const to = cursor + sweep - D_GAP / 2;
    cursor += sweep;
    return { key: it.label, d: arcPath(from, Math.max(from + 0.5, to)), i };
  });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className="mt-6 flex flex-1 flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6"
    >
      {/* The ring is the dominant mark in this panel, and the figure sits
          inside it rather than competing with it: the client asked for a
          slightly larger donut and a smaller share figure, so the drawing
          went up a step (126 → 144px, 152 from sm) and the number came down
          one (max 1.55rem → 1.25rem). */}
      <div className="relative shrink-0">
        <svg viewBox="0 0 120 120" className="block h-[144px] w-[144px] sm:h-[152px] sm:w-[152px]">
          <circle
            cx={D_C}
            cy={D_C}
            r={D_R}
            fill="none"
            stroke="var(--le-line)"
            strokeWidth="13"
          />
          {arcs.map(({ key, d, i }) => (
            <path
              key={key}
              d={d}
              fill="none"
              stroke={SERIES[i % SERIES.length]}
              strokeWidth={i === 0 ? 15 : 13}
              strokeLinecap="butt"
              pathLength={1}
              strokeDasharray={1}
              style={{
                strokeDashoffset: on ? 0 : 1,
                transition: `stroke-dashoffset 1000ms var(--le-ease-out) ${100 + i * 150}ms`,
              }}
            />
          ))}
        </svg>

        {/* The leading share, in the hole — two steps below the section's
            headline figure now, so it reads as a chart label and the ring
            around it stays the loudest thing in the panel. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="le-mono text-[clamp(1.05rem,1.4vw,1.25rem)] font-semibold leading-none tracking-[-0.04em] text-accent-bright">
            <Counter value={lead.share} suffix="%" />
          </span>
          <span className="mt-1.5 text-[10px] leading-none text-ink-3">{lead.label}</span>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-[7px]">
        {items.map((it, i) => (
          <li
            key={it.label}
            className="flex items-center gap-2.5"
            style={{
              opacity: on ? 1 : 0,
              transform: on ? "none" : "translateX(8px)",
              transition: `opacity 500ms var(--le-ease-out) ${
                260 + i * 110
              }ms, transform 500ms var(--le-ease-out) ${260 + i * 110}ms`,
            }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: SERIES[i % SERIES.length] }}
            />
            <span className="flex-1 truncate text-[11px] text-ink-2">{it.label}</span>
            <span className="le-mono text-[11px] font-semibold text-ink">{it.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------- 4 · big figure -------------------------- */

function ShortlistFigure({
  value,
  unit,
  note,
  scale,
}: {
  value: number;
  unit: string;
  note: string;
  scale: string[];
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const on = reduced || inView;
  const decimals = Number.isInteger(value) ? 0 : 1;

  return (
    <div ref={ref} className="mt-6 flex flex-1 flex-col">
      <div role="img" aria-label={`${value} — ${unit}`} className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-5 -top-7 h-[130px] w-[130px] rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--le-accent-bright-rgb) / 0.16), transparent 68%)",
            opacity: on ? 1 : 0,
            transition: "opacity 900ms var(--le-ease-out) 120ms",
          }}
        />

        <div className="relative flex items-baseline gap-2">
          <span
            className={`le-mono ${FIGURE} font-semibold leading-none tracking-[-0.04em] text-accent-bright`}
          >
            <Counter value={value} decimals={decimals} />
          </span>
          <span className="text-[11px] leading-tight text-ink-3">{unit}</span>
        </div>

        <svg
          viewBox={`0 0 ${VB_W} 3`}
          className="relative mt-3.5 block h-auto w-full"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="1.5"
            x2={VB_W}
            y2="1.5"
            stroke="var(--le-accent-bright)"
            strokeWidth="3"
            pathLength={1}
            strokeDasharray={1}
            style={{
              strokeDashoffset: on ? 0 : 1,
              transition: "stroke-dashoffset 1100ms var(--le-ease-out) 200ms",
            }}
          />
        </svg>
      </div>

      <p className="mt-5 text-pretty text-[12.5px] font-medium leading-[1.55] tracking-[-0.01em] text-ink">
        {note}
      </p>

      <ul className="mt-5 space-y-2 border-t border-line pt-4">
        {scale.map((line, i) => (
          <li
            key={line}
            className="flex items-start gap-2.5 text-[11.5px] leading-[1.5]"
            style={{
              opacity: on ? 1 : 0,
              transform: on ? "none" : "translateY(6px)",
              transition: `opacity 520ms var(--le-ease-out) ${
                420 + i * 130
              }ms, transform 520ms var(--le-ease-out) ${420 + i * 130}ms`,
            }}
          >
            <span
              aria-hidden="true"
              className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: i === 0 ? "var(--le-ink-3)" : "var(--le-accent-bright)" }}
            />
            <span className={i === 0 ? "text-ink-3" : "text-ink-2"}>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------ section ----------------------------- */

/* ------------------------- 0 · the growth curve --------------------- */

const G_W = 720;
const G_H = 196;
const G_L = 30;
const G_R = 14;
const G_T = 18;
const G_B = 24;
const G_MAX = 80;
const G_PLOT_W = G_W - G_L - G_R;
const G_PLOT_H = G_H - G_T - G_B;

const gx = (i: number, n: number) => G_L + (n <= 1 ? 0 : (i / (n - 1)) * G_PLOT_W);
const gy = (v: number) => G_T + (1 - v / G_MAX) * G_PLOT_H;

/**
 * Catmull-Rom through every point, emitted as cubic beziers. A growth story
 * reads as a curve, not as a dot-to-dot — and unlike a hand-tuned spline this
 * passes through the real values, so the line never overstates a month.
 */
function smoothPath(values: readonly number[]): string {
  const n = values.length;
  if (n === 0) return "";
  const pt = (i: number) => {
    const k = i < 0 ? 0 : i > n - 1 ? n - 1 : i;
    return { x: gx(k, n), y: gy(values[k]!) };
  };
  let d = `M${pt(0).x.toFixed(2)} ${pt(0).y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = pt(i - 1);
    const p1 = pt(i);
    const p2 = pt(i + 1);
    const p3 = pt(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)},${c2x.toFixed(2)} ${c2y.toFixed(2)},${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

type Series = { label: string; values: readonly number[] };

/**
 * What six months can look like: the treated curve against the untreated one.
 *
 * The line draws itself on arrival using `pathLength="1"` — the path reports a
 * normalised length, so `strokeDasharray: 1` with a `strokeDashoffset` from 1
 * to 0 draws it exactly, with no DOM measurement and no resize handling.
 *
 * The figures are MODELLED, not audited, and `note` says so directly under the
 * chart. That line is not decoration and must not be dropped.
 */
function GrowthChart({
  months,
  series,
  unit,
  deltaLabel,
  note,
}: {
  months: readonly string[];
  series: readonly Series[];
  unit: string;
  deltaLabel: string;
  note: string;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: false });
  const on = reduced || inView;

  const [lead, base] = series;
  if (!lead || !base) return null;

  const n = lead.values.length;
  const last = lead.values[n - 1] ?? 0;
  const baseLast = base.values[n - 1] ?? 0;
  const delta = last - baseLast;

  const leadPath = smoothPath(lead.values);
  const basePath = smoothPath(base.values);

  const lastX = gx(n - 1, n);
  const areaPath = `${leadPath}L${lastX.toFixed(2)} ${(G_T + G_PLOT_H).toFixed(2)}L${gx(0, n).toFixed(2)} ${(G_T + G_PLOT_H).toFixed(2)}Z`;

  /* Three hairlines. A dense grid is what makes a chart look generated. */
  const ticks = [0, 40, 80];

  return (
    <div ref={ref}>
      <svg
        viewBox={`0 0 ${G_W} ${G_H}`}
        className="block w-full"
        role="img"
        aria-label={`${lead.label}: ${lead.values.join(", ")} ${unit}. ${base.label}: ${base.values.join(", ")} ${unit}.`}
      >
        {/* Scale. Hairlines at 6% and labels in small mono — the chart should
            read as an instrument, not as an illustration of one. */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={G_L}
              x2={G_W - G_R}
              y1={gy(v)}
              y2={gy(v)}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            <text
              x={G_L - 9}
              y={gy(v) + 3.5}
              textAnchor="end"
              className="le-mono fill-ink-3"
              style={{ fontSize: 9 }}
            >
              {v}
            </text>
          </g>
        ))}

        {/* A flat tint under the treated curve. Solid low alpha, not a
            gradient — the client removed gradients as UI chrome. */}
        <path
          d={areaPath}
          fill="rgb(var(--le-accent-bright-rgb) / 0.09)"
          style={{
            opacity: on ? 1 : 0,
            transition: reduced ? undefined : "opacity 800ms var(--le-ease-out) 500ms",
          }}
        />

        {/* Doing nothing: a fine dotted rule, deliberately quiet. */}
        <path
          d={basePath}
          fill="none"
          stroke="rgb(var(--le-ink-3-rgb) / 0.75)"
          strokeWidth="1.25"
          strokeDasharray="1.5 5"
          strokeLinecap="round"
          style={{
            opacity: on ? 1 : 0,
            transition: reduced ? undefined : "opacity 600ms var(--le-ease-out) 160ms",
          }}
        />

        {/* Doing this. One clean 2px stroke, no glow, no marker clutter. */}
        <path
          d={leadPath}
          pathLength={1}
          fill="none"
          stroke="rgb(var(--le-accent-bright-rgb))"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: on ? 0 : 1,
            transition: reduced
              ? undefined
              : "stroke-dashoffset 1400ms cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        />

        {/* One marker, at the end. Ringed in the panel colour so it reads as
            sitting on the line rather than punched through it. */}
        <circle
          cx={lastX}
          cy={gy(last)}
          r="3.4"
          fill="rgb(var(--le-accent-bright-rgb))"
          stroke="rgb(var(--le-surface-rgb))"
          strokeWidth="2"
          style={{
            opacity: on ? 1 : 0,
            transition: reduced ? undefined : "opacity 360ms var(--le-ease-out) 1380ms",
          }}
        />

        {/* The two end values, set as type rather than as chart furniture. */}
        <g
          style={{
            opacity: on ? 1 : 0,
            transition: reduced ? undefined : "opacity 420ms var(--le-ease-out) 1440ms",
          }}
        >
          <text
            x={lastX}
            y={gy(last) - 12}
            textAnchor="end"
            className="fill-ink"
            style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.015em" }}
          >
            {last}
            {unit}
          </text>
          <text
            x={lastX}
            y={gy(baseLast) + 17}
            textAnchor="end"
            className="le-mono fill-ink-3"
            style={{ fontSize: 9.5 }}
          >
            {baseLast}
            {unit}
          </text>
        </g>

        {/* Month labels, on the baseline. */}
        {months.map((m, i) => (
          <text
            key={m}
            x={gx(i, n)}
            y={G_H - 6}
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            className="le-mono fill-ink-3"
            style={{ fontSize: 9 }}
          >
            {m}
          </text>
        ))}
      </svg>

      {/* Legend, delta and the honesty note. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
        <span className="flex items-center gap-2 text-[12.5px] font-medium leading-[1.5] text-ink">
          <span aria-hidden="true" className="block h-[3px] w-4 rounded-full bg-accent-bright" />
          {lead.label}
        </span>
        <span className="flex items-center gap-2 text-[12.5px] leading-[1.5] text-ink-3">
          <span
            aria-hidden="true"
            className="block h-[3px] w-4 rounded-full bg-ink-3"
            style={{ opacity: 0.7 }}
          />
          {base.label}
        </span>
        <span className="ml-auto flex items-baseline gap-2">
          <span className="text-[11px] leading-[1.5] text-ink-3">{deltaLabel}</span>
          <span className="le-mono text-[15px] font-semibold text-accent-bright">
            +{delta}
            {unit}
          </span>
        </span>
      </div>

      <p className="mt-3 text-[11px] leading-[1.6] text-ink-3">{note}</p>
    </div>
  );
}

export default function MarketData() {
  const { t } = useLang();
  const d = t.data;

  return (
    <section
      id="markt-daten"
      aria-labelledby="markt-daten-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg le-section"
    >
      {/* The section's single light source — blue-led now that every figure
          is blue, with gold left only as a trace at the edges. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[4%] h-[420px] w-[920px] max-w-[150vw] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgb(var(--le-accent-bright-rgb) / 0.13), rgb(var(--le-accent-rgb) / 0.18) 46%, transparent 72%)",
          }}
        />
      </div>

      <div className="le-container relative">
        <div className="max-w-2xl">
          <Reveal dir="up">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
              <p className="le-kicker">{d.kicker}</p>
            </div>
          </Reveal>

          <h2
            id="markt-daten-title"
            className="mt-6 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-ink"
          >
            <RevealText lines={toLines(d.title)} delay={60} stagger={130} />
          </h2>

          <Reveal dir="up" delay={140}>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.65] text-ink-2">{d.sub}</p>
          </Reveal>
        </div>

        {/* The growth curve leads the section: it is the promise the rest of
            the market data exists to justify. Full width, above the 2×2. */}
        <Reveal dir="up" threshold={0.1} className="mx-auto mt-12 block max-w-4xl lg:mt-16">
          <Panel title={d.growth.title} meta={d.growth.meta}>
            <div className="mt-5">
              <GrowthChart
                months={d.growth.months}
                series={d.growth.series}
                unit={d.growth.unit}
                deltaLabel={d.growth.deltaLabel}
                note={d.growth.note}
              />
            </div>
          </Panel>
        </Reveal>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-2">
          <Reveal dir="up" threshold={0.1} className="h-full">
            <Panel title={d.adoption.title} meta={d.adoption.meta}>
              <AdoptionChart
                years={d.adoption.years}
                values={d.adoption.values}
                unit={d.adoption.unit}
                note={d.adoption.note}
              />
            </Panel>
          </Reveal>

          <Reveal dir="up" delay={90} threshold={0.1} className="h-full">
            <Panel title={d.split.title} meta={d.split.meta}>
              <SplitChart items={d.split.items} />
            </Panel>
          </Reveal>

          <Reveal dir="up" delay={60} threshold={0.1} className="h-full">
            <Panel title={d.engines.title} meta={d.engines.meta}>
              <EnginesChart items={d.engines.items} />
            </Panel>
          </Reveal>

          <Reveal dir="up" delay={140} threshold={0.1} className="h-full">
            <Panel title={d.shortlist.title} meta={d.shortlist.meta}>
              <ShortlistFigure
                value={d.shortlist.value}
                unit={d.shortlist.unit}
                note={d.shortlist.note}
                scale={d.shortlist.scale}
              />
            </Panel>
          </Reveal>
        </div>

        <Reveal dir="up" delay={80}>
          <p className="mt-8 max-w-3xl text-[11px] leading-[1.7] text-ink-3 lg:mt-10">
            {d.sources}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
