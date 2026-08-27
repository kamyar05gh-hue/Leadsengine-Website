import type { Dict } from "@/i18n/translations.de";
import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type StatItem = Dict["shift"]["stats"][number];

/** Break a headline at sentence boundaries for the masked line reveal. */
function toLines(title: string): string[] {
  const parts = title.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [title];
  const lines = parts.map((p) => p.trim()).filter(Boolean);
  return lines.length ? lines : [title];
}

/**
 * Three market figures, set as data rather than as a billboard.
 *
 * The figures sit in three open columns split by hairlines — no panels, no
 * rounded corners, nothing boxed. The numerals are BLUE (`accent-bright`),
 * which is the structural colour of the site; gold is left to the small marks
 * around them so the section still carries warmth without competing.
 *
 * MOTION — one idea only. A single observer releases the three columns in
 * order and each counter runs exactly once. There is no scale, no travelling
 * marker, no ring, no scroll listener and nothing that repeats: every figure
 * is fully readable the moment it lands and stays that way.
 */
export default function MarketShift() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const stats = t.shift.stats;
  const count = stats.length;

  const { ref: rowRef, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const on = reduced || inView;

  return (
    <section
      id="markt"
      aria-labelledby="markt-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg le-section"
    >
      {/* The section's ground: one wide, low wash. Static — it sets the
          temperature of the section, it does not perform. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-12%] mx-auto h-[380px] w-[860px] max-w-[150vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--le-accent-rgb) / 0.3), rgb(var(--le-gold-rgb) / 0.09) 54%, transparent 72%)",
        }}
      />

      <div className="le-container relative">
        <div className="max-w-2xl">
          <h2
            id="markt-title"
            className="text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.14] tracking-[-0.025em]"
          >
            <RevealText lines={toLines(t.shift.title)} stagger={120} />
          </h2>

          <Reveal dir="up" delay={140}>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.65] text-ink-2">{t.shift.sub}</p>
          </Reveal>
        </div>

        {/* Three open columns. Hairlines only. */}
        <div
          ref={rowRef}
          className="mt-12 grid grid-cols-1 divide-y divide-line border-y border-line md:mt-16 md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          {stats.map((stat, i) => (
            <Figure
              key={stat.source}
              stat={stat}
              index={i}
              edge={i === 0 ? "start" : i === count - 1 ? "end" : "mid"}
              sourceLabel={t.shift.sourceLabel}
              on={on}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One figure. Blue numeral at a confident — not billboard — size, a gold
 * index and dot beside it, one hairline, the claim, the source. Everything is
 * at full contrast from the moment it arrives; nothing here reacts to hover.
 */
function Figure({
  stat,
  index,
  edge,
  sourceLabel,
  on,
}: {
  stat: StatItem;
  index: number;
  edge: "start" | "end" | "mid";
  sourceLabel: string;
  on: boolean;
}) {
  const delay = index * 110;

  return (
    <div
      className={`relative min-w-0 py-9 md:px-5 md:py-11 lg:px-7 ${
        edge === "start" ? "md:pl-0" : edge === "end" ? "md:pr-0" : ""
      }`}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(16px)",
        transition: `opacity 640ms var(--le-ease-out) ${delay}ms, transform 640ms var(--le-ease-out) ${delay}ms`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="le-mono text-[11px] font-semibold tracking-[0.2em] text-gold"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
      </div>

      {/* The figure. The count-up was removed at the client's request — the
          number is simply set, at full size, from the first frame. */}
      <span className="le-mono mt-4 block text-[clamp(1.75rem,2.6vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-accent-bright">
        {stat.decimals > 0 ? stat.value.toFixed(stat.decimals) : stat.value}
        {stat.suffix}
      </span>

      <span
        aria-hidden="true"
        className="mt-4 block h-px w-full origin-left bg-gold/60"
        style={{
          transform: on ? "scaleX(1)" : "scaleX(0)",
          transition: `transform 800ms var(--le-ease-out) ${delay + 180}ms`,
        }}
      />

      <p className="mt-5 max-w-[28ch] text-[15px] leading-[1.65] text-ink-2">{stat.label}</p>

      <p className="le-mono mt-4 max-w-[32ch] text-[12px] leading-[1.55] text-ink-3">
        {sourceLabel}: {stat.source}
      </p>
    </div>
  );
}
