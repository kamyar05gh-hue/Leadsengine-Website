import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import Typed from "@/components/Typed";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Break a headline at sentence boundaries for the masked line reveal. */
function toLines(title: string): string[] {
  const parts = title.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [title];
  const lines = parts.map((p) => p.trim()).filter(Boolean);
  return lines.length ? lines : [title];
}

/* ------------------------------------------------------------------ */
/* The funnel                                                          */
/* ------------------------------------------------------------------ */

/**
 * What we optimise for — argued as a funnel, because the argument IS a funnel.
 *
 * Four named stages narrow from everything an AI is asked down to the handful
 * asked by someone about to buy, and the TARGET underneath is what they narrow
 * to: three people standing in the bullseye. The funnel drawing that used to
 * sit beside the list was removed at the client's request — the target carries
 * the idea on its own.
 *
 * The sequence runs ONCE, on arrival — `once: true`, with the stagger in CSS
 * `transition-delay` rather than a timer, so nothing loops in the visitor's
 * peripheral vision while they read. Under reduced motion the finished state
 * renders on the first paint.
 */
export default function Audience() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2, once: true });
  const a = t.audience;
  const rings = a.rings;
  const on = reduced || inView;

  return (
    <section
      id="zielgruppe"
      aria-labelledby="audience-title"
      className="le-noise le-section relative scroll-mt-24 overflow-hidden bg-bg-alt"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-8%] top-[18%] h-[440px] w-[660px] max-w-[140vw] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgb(var(--le-accent-rgb) / 0.24), transparent 70%)",
        }}
      />

      <div className="le-container relative">
        <div className="max-w-2xl">
          <Reveal dir="up">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
              <p className="le-kicker">{a.kicker}</p>
            </div>
          </Reveal>

          <h2
            id="audience-title"
            className="mt-5 text-[clamp(1.7rem,2.9vw,2.5rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-ink"
          >
            <RevealText lines={toLines(a.title)} delay={60} stagger={120} />
          </h2>

          {/* The one typed line in this section. */}
          <p className="mt-6 text-[clamp(1rem,1.7vw,1.15rem)] font-medium leading-[1.5] text-ink">
            <Typed text={a.lead} />
          </p>

          <Reveal dir="up" delay={190}>
            <p className="mt-4 text-[15px] leading-[1.7] text-ink-2">{a.body}</p>
          </Reveal>
        </div>

        {/* Two columns of equal height; row N of each always lines up. */}
        <div
          ref={ref}
          className="mt-12 grid grid-cols-1 items-stretch gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14"
        >
          {/* ---- the same four stages, in words ---- */}
          <ol className="order-1 flex flex-col lg:col-span-7">
            {rings.map((r, i) => {
              const lastRow = i === rings.length - 1;
              return (
                <li
                  key={r.label}
                  className={`flex flex-1 flex-col justify-center border-l-2 py-3 pl-5 ${
                    lastRow ? "border-accent-bright" : "border-line"
                  }`}
                  style={{
                    opacity: on ? 1 : 0,
                    transform: on ? "none" : "translateY(10px)",
                    transition: reduced
                      ? undefined
                      : `opacity 520ms var(--le-ease-out) ${200 + i * 380}ms, transform 520ms var(--le-ease-out) ${200 + i * 380}ms`,
                  }}
                >
                  <span
                    className={`block text-[15px] font-semibold leading-[1.4] tracking-[-0.012em] ${
                      lastRow ? "text-accent-bright" : "text-ink"
                    }`}
                  >
                    {r.label}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-[1.65] text-ink-2">
                    {r.note}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* The target, to the RIGHT of the stages: they narrow to this. */}
          <div className="order-2 self-center lg:col-span-5">
            <div aria-hidden="true" className="mx-auto mt-1 w-full max-w-[420px]">
              <svg viewBox="0 24 200 116" className="block w-full">
                {/* concentric rings — the aim */}
                {[46, 33, 20].map((r, i) => (
                  <circle
                    key={r}
                    cx="100"
                    cy="80"
                    r={r}
                    fill="none"
                    stroke={`rgb(var(--le-accent-bright-rgb) / ${0.28 + i * 0.22})`}
                    strokeWidth={i === 2 ? 1.6 : 1}
                    style={{
                      opacity: on ? 1 : 0,
                      transform: on ? "none" : "scale(0.86)",
                      transformOrigin: "100px 80px",
                      transition: reduced
                        ? undefined
                        : `opacity 520ms var(--le-ease-out) ${1780 + i * 150}ms, transform 520ms var(--le-ease-out) ${1780 + i * 150}ms`,
                    }}
                  />
                ))}

                {/* crosshair */}
                <g
                  stroke="rgb(var(--le-accent-bright-rgb) / 0.4)"
                  strokeWidth="1"
                  style={{
                    opacity: on ? 1 : 0,
                    transition: reduced
                      ? undefined
                      : "opacity 500ms var(--le-ease-out) 2100ms",
                  }}
                >
                  <line x1="46" y1="80" x2="70" y2="80" />
                  <line x1="130" y1="80" x2="154" y2="80" />
                  <line x1="100" y1="26" x2="100" y2="50" />
                  <line x1="100" y1="110" x2="100" y2="134" />
                </g>

                {/* the people in the bullseye — head and shoulders, three of
                    them, the same three that came through the funnel */}
                {[-13, 0, 13].map((dx, i) => (
                  <g
                    key={dx}
                    transform={`translate(${100 + dx} 80)`}
                    fill="rgb(var(--le-accent-bright-rgb))"
                    style={{
                      opacity: on ? 1 : 0,
                      transform: on
                        ? `translate(${100 + dx}px, 80px)`
                        : `translate(${100 + dx}px, 86px)`,
                      transition: reduced
                        ? undefined
                        : `opacity 460ms var(--le-ease-out) ${2260 + i * 130}ms, transform 460ms var(--le-ease-out) ${2260 + i * 130}ms`,
                    }}
                  >
                    <circle cx="0" cy="-4.5" r="3.1" />
                    <path d="M-5.2 6.2C-5.2 2.6 -2.9 0.8 0 0.8C2.9 0.8 5.2 2.6 5.2 6.2Z" />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* The closing line, set as a quote. */}
        <Reveal dir="up" delay={80}>
          <figure className="mx-auto mt-14 max-w-3xl text-center lg:mt-16">
            <span
              aria-hidden="true"
              className="mx-auto mb-5 block h-px w-14 bg-accent-bright"
            />
            <blockquote className="text-balance text-[clamp(1.15rem,2.2vw,1.6rem)] font-medium italic leading-[1.45] tracking-[-0.015em] text-ink">
              {a.closing}
            </blockquote>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
