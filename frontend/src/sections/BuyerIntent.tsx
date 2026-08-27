import { Check, X } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Break a headline at sentence boundaries for the masked line reveal. */
function toLines(title: string): string[] {
  const parts = title.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [title];
  const lines = parts.map((p) => p.trim()).filter(Boolean);
  return lines.length ? lines : [title];
}

/**
 * Why it works: eight against eight.
 *
 * The colour is a plain verdict signal — RED for the column that gets it wrong,
 * BLUE (`accent-bright`, the structural colour of the site) for the column that
 * gets it right. There is no green anywhere in here, and no gold: the client
 * asked for the "Leads Engine" heading to read WHITE, so the winning column is
 * carried by the blue rule and white type alone.
 *
 * MOTION — one idea only. Each column arrives once and its rows cascade behind
 * it, 55ms apart, from a single observer. No scroll-driven edges, no rings, no
 * loops, and no per-row observers. Both columns are typeset to full contrast at
 * rest: hover adds nothing that legibility needs.
 */
export default function BuyerIntent() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();

  return (
    <section
      id="buyer-intent"
      aria-labelledby="intent-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg-alt le-section"
    >
      {/* The section's ground — static. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[14%] h-[420px] w-[620px] max-w-[130vw] translate-x-[12%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--le-accent-rgb) / 0.28), rgb(var(--le-gold-rgb) / 0.09) 48%, transparent 72%)",
        }}
      />

      <div className="le-container relative">
        <div className="max-w-2xl">
          <Reveal dir="up">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
              <p className="le-kicker">{t.intent.kicker}</p>
            </div>
          </Reveal>

          <h2
            id="intent-title"
            className="mt-5 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.14] tracking-[-0.025em]"
          >
            <RevealText lines={toLines(t.intent.title)} delay={60} stagger={120} />
          </h2>

          <Reveal dir="up" delay={130}>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.65] text-ink-2">{t.intent.body}</p>
          </Reveal>
        </div>

        {/* Eight against eight, red against blue. The two worked examples that
            used to sit above this (generic vs buyer-intent query) were removed
            at the client's request. */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-2 lg:gap-8">
          <VerdictColumn
            tone="bad"
            label={t.intent.othersLabel}
            items={t.intent.others}
            reduced={reduced}
          />
          <VerdictColumn
            tone="good"
            label={t.intent.usLabel}
            items={t.intent.us}
            reduced={reduced}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * One verdict column. `tone` decides the whole palette of the column in one
 * place, which is what keeps red-vs-blue readable as a single signal rather
 * than as decoration applied per element.
 */
function VerdictColumn({
  tone,
  label,
  items,
  reduced,
}: {
  tone: "bad" | "good";
  label: string;
  items: readonly string[];
  reduced: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.08 });
  const on = reduced || inView;
  const bad = tone === "bad";

  const Mark = bad ? X : Check;

  return (
    <div
      ref={ref}
      className={`relative min-w-0 overflow-hidden rounded-2xl border pl-4 pr-5 sm:pl-5 sm:pr-6 ${
        bad ? "border-danger-deep/70 bg-danger/[0.035]" : "border-accent-bright/30 bg-accent-bright/[0.03]"
      }`}
    >
      {/* A solid verdict edge. Static: the colour is the message, not the fill. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 block w-[3px] ${
          bad ? "bg-danger" : "bg-accent-bright"
        }`}
      />

      <div
        className={`flex items-center gap-2.5 border-b py-6 ${
          bad ? "border-danger-deep/60" : "border-accent-bright/25"
        }`}
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(14px)",
          transition:
            "opacity 560ms var(--le-ease-out), transform 560ms var(--le-ease-out)",
        }}
      >
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] ${
            bad ? "bg-danger/15 ring-1 ring-danger/40" : "bg-accent-bright/15 ring-1 ring-accent-bright/45"
          }`}
        >
          <Mark size={12} strokeWidth={2.7} className={bad ? "text-danger" : "text-accent-bright"} />
        </span>
        {/* "Leads Engine" reads white — the client's call. The losing column
            keeps red, so the verdict still lands without a second accent. */}
        <h3 className={`le-kicker ${bad ? "text-danger" : "text-ink"}`}>{label}</h3>
      </div>

      <ul>
        {items.map((item, i) => (
          <li
            key={item}
            className={
              i === items.length - 1
                ? ""
                : `border-b ${bad ? "border-danger-deep/40" : "border-accent-bright/15"}`
            }
            style={{
              opacity: on ? 1 : 0,
              transform: on ? "none" : "translateY(12px)",
              transition: `opacity 520ms var(--le-ease-out) ${120 + i * 55}ms, transform 520ms var(--le-ease-out) ${120 + i * 55}ms`,
            }}
          >
            <div className="flex items-start gap-3 py-3.5">
              <span
                aria-hidden="true"
                className={`le-mono mt-[3px] w-[18px] shrink-0 text-[10.5px] font-semibold leading-[1.5] tracking-[0.06em] ${
                  bad ? "text-danger/80" : "text-accent-bright/80"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <Mark
                size={15}
                strokeWidth={2.5}
                aria-hidden="true"
                className={`mt-[3px] shrink-0 ${bad ? "text-danger" : "text-accent-bright"}`}
              />
              <span className={`min-w-0 text-[14.5px] leading-[1.6] ${bad ? "text-ink-2" : "text-ink"}`}>
                {item}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="h-6" />
    </div>
  );
}
