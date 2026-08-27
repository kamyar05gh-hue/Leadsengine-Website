import { EyeOff, List, Search } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Der blinde Fleck — the emotional low point of the page, and the only section
 * that is allowed to feel heavy.
 *
 * The client asked for "small and simple icons with an animated small step
 * timeline". So the three hand-drawn scenes are gone and the story is told as
 * one compact timeline: a hairline running through three numbered nodes, each
 * beat carrying a single 22px line icon.
 *
 *   1  SEARCH   someone is looking for exactly what you sell — and asks a
 *               machine.
 *   2  LIST     the answer is a list of three to five names. Yours is not on
 *               it.
 *   3  EYE-OFF  nothing ever reports the loss, so nothing tells you to act.
 *               This is the failure state, and the only node that lights red.
 *
 * Deliberate constraints:
 *
 *   NO JARGON   there is not one category term in this file. Every word on
 *               screen comes from `t.pain`.
 *   ONE GESTURE the timeline is the whole animation and it runs exactly once,
 *               when the list enters: node 1 lights, the hairline draws to
 *               node 2, node 2 lights, the hairline draws on, node 3 lights
 *               red. The rail is a scaled 1px span — `transform` and
 *               `opacity` only — and reduced motion renders the finished
 *               state on the first paint with no transition at all.
 *   RESTRAINED  small icons, a hairline rail, 28px nodes. Nothing here is a
 *               billboard; the section's weight comes from its air and its
 *               ground, not from its ornament.
 */

/** One icon per beat, in story order. Bare line icons — no plates, no boxes. */
const ICONS = [Search, List, EyeOff] as const;

/** Node diameter in px. The rail passes through its centre, at 14px. */
const NODE = 28;

/** Vertical gap between beats on a phone (`gap-y-12` = 3rem). */
const STACK_GAP = 48;

/** Clearance the rail keeps from a node's edge, so it never touches one. */
const CLEAR = 6;

/** Delay between one node lighting and the next. */
const BEAT_MS = 300;

/* ------------------------------------------------------------------ */

function Beat({
  index,
  last,
  step,
  title,
  body,
  on,
  reduced,
}: {
  index: number;
  last: boolean;
  step: string;
  title: string;
  body: string;
  on: boolean;
  reduced: boolean;
}) {
  const Icon = ICONS[index] ?? Search;

  /* The final beat is the failure state — the only red in the timeline. */
  const fail = last;
  const tone = fail ? "var(--le-danger)" : "var(--le-ink-2)";

  const at = index * BEAT_MS;
  const ease = "var(--le-ease-out)";

  /** Node + icon arrive together, one beat after the previous node. */
  const lightIn = reduced
    ? undefined
    : `border-color 520ms ${ease} ${at}ms, color 520ms ${ease} ${at}ms, box-shadow 620ms ${ease} ${at}ms`;
  const riseIn = reduced
    ? undefined
    : `opacity 520ms ${ease} ${at + 90}ms, transform 520ms ${ease} ${at + 90}ms`;
  /** The rail leaving this node draws while the eye is still on it. */
  const drawIn = reduced ? undefined : `transform 460ms ${ease} ${at + 150}ms`;

  /* The rail into the last node cools from neutral into the failure red. */
  const railInto = fail ? "var(--le-danger)" : "var(--le-line-strong)";

  return (
    /* Everything in this column shares one centre line: the numbered node, the
       icon under it, the title and the body. The client asked for the icons to
       sit centrally with their text, and a centred column is also what the rest
       of this section already does — the headline, the lead and the closing
       line are all centred. */
    <li className="relative flex min-w-0 flex-col items-center px-2 text-center md:px-4 md:pt-12">
      {/* -------- the rail leaving this node -------------------------- */}
      {!last && (
        <>
          {/* Phone: the rail lives ENTIRELY IN THE GAP between one beat and
              the next node.

              It used to start just under the node (`top: NODE + CLEAR`) and
              run to `bottom: -(STACK_GAP - CLEAR)` — i.e. straight down the
              centre of the beat, THROUGH the icon, the heading and the body.
              And because it is absolutely positioned, it paints in the
              positioned-descendant layer, which is ABOVE in-flow content: it
              did not pass discreetly behind the icon, it drew a line across
              it. Invisible at md and up, where the rail runs sideways through
              empty column gutters, and unmissable on a phone.

              Anchored to `top: 100%` it starts where this beat's content ends
              and stops short of the next node, so it can only ever cross the
              48px of empty space it is meant to bridge. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute w-px origin-top md:hidden"
            style={{
              left: "50%",
              marginLeft: -0.5,
              top: `calc(100% + ${CLEAR}px)`,
              height: STACK_GAP - CLEAR * 2,
              background: `linear-gradient(to bottom, var(--le-line-strong), ${railInto})`,
              transform: on ? "scaleY(1)" : "scaleY(0)",
              transition: drawIn,
            }}
          />
          {/* From md: across the row, from this node's edge to the next
              column's node edge. Both nodes are centred in equal columns, so
              the run is one column wide less the two radii and clearances. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute hidden h-px origin-left md:block"
            style={{
              top: 48 + (NODE - 1) / 2,
              left: `calc(50% + ${NODE / 2 + CLEAR}px)`,
              width: `calc(100% - ${NODE + CLEAR * 2}px)`,
              background: `linear-gradient(to right, var(--le-line-strong), ${railInto})`,
              transform: on ? "scaleX(1)" : "scaleX(0)",
              transition: drawIn,
            }}
          />
        </>
      )}

      {/* -------- the node ------------------------------------------- */}
      <span
        aria-hidden="true"
        className="le-mono flex shrink-0 items-center justify-center rounded-full border bg-bg text-[11.5px] font-semibold"
        style={{
          width: NODE,
          height: NODE,
          borderColor: on ? tone : "var(--le-line-strong)",
          color: on ? "var(--le-ink)" : "var(--le-ink-3)",
          boxShadow: on
            ? `0 0 0 4px ${fail ? "rgb(var(--le-danger-rgb) / 0.08)" : "rgba(255,255,255,0.04)"}`
            : "0 0 0 4px transparent",
          transition: lightIn,
        }}
      >
        {step}
      </span>

      {/* -------- the icon, on the same centre line ------------------- */}
      <span
        aria-hidden="true"
        className="mt-5 block"
        style={{
          color: on ? tone : "var(--le-ink-3)",
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(6px)",
          transition: reduced
            ? undefined
            : `${riseIn}, color 520ms ${ease} ${at}ms`,
        }}
      >
        <Icon size={26} strokeWidth={1.5} />
      </span>

      <h3
        className="mt-4 text-[0.98rem] font-semibold leading-[1.3] tracking-[-0.02em] text-ink sm:text-[1.05rem]"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(6px)",
          transition: reduced
            ? undefined
            : `opacity 520ms ${ease} ${at + 150}ms, transform 520ms ${ease} ${at + 150}ms`,
        }}
      >
        {title}
      </h3>

      <p
        className="mx-auto mt-2 max-w-[34ch] text-[13.5px] leading-[1.66] text-ink-2"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(6px)",
          transition: reduced
            ? undefined
            : `opacity 520ms ${ease} ${at + 220}ms, transform 520ms ${ease} ${at + 220}ms`,
        }}
      >
        {body}
      </p>
    </li>
  );
}

/* ------------------------------------------------------------------ */

export default function Pain() {
  const { t } = useLang();
  const pain = t.pain;

  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLOListElement>({ threshold: 0.2 });
  const on = reduced || inView;

  return (
    <section
      id="blinder-fleck"
      aria-labelledby="pain-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg le-section"
    >
      {/* A single static wash bleeding down from the top edge — the ceiling
          lowers as you arrive. No motion, no loop. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 58% at 50% 0%, rgb(var(--le-danger-rgb) / 0.07), transparent 62%)",
        }}
      />

      <div className="le-container relative">
        {/* ------------------------------------------------------------ */}
        {/* Head                                                          */}
        {/* ------------------------------------------------------------ */}
        <Reveal dir="up">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
            <p className="le-kicker">{pain.kicker}</p>
            <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
          </div>
        </Reveal>

        <h2
          id="pain-title"
          className="mx-auto mt-6 max-w-3xl text-center text-[clamp(1.6rem,2.9vw,2.45rem)] font-semibold leading-[1.16] tracking-[-0.025em] text-ink"
        >
          <RevealText lines={[pain.title]} delay={60} />
        </h2>

        <Reveal dir="up" delay={140}>
          <p className="mx-auto mt-7 max-w-2xl text-center text-[15px] leading-[1.7] text-ink-2">
            {pain.lead}
          </p>
        </Reveal>

        {/* ------------------------------------------------------------ */}
        {/* The story — three beats on one drawn timeline                 */}
        {/* ------------------------------------------------------------ */}
        <ol
          ref={ref}
          className="mx-auto mt-14 grid max-w-3xl list-none grid-cols-1 gap-y-12 md:mt-16 md:max-w-none md:grid-cols-3 md:gap-y-0"
        >
          {pain.items.map((item, i) => (
            <Beat
              key={item.title}
              index={i}
              last={i === pain.items.length - 1}
              step={item.step}
              title={item.title}
              body={item.body}
              on={on}
              reduced={reduced}
            />
          ))}
        </ol>

        {/* ------------------------------------------------------------ */}
        {/* The turn — the one line that points at the next section       */}
        {/* ------------------------------------------------------------ */}
        <Reveal dir="up" threshold={0.25} className="mx-auto mt-16 max-w-2xl text-center lg:mt-20">
          {/* Gold appears exactly once in this section, here. */}
          <span aria-hidden="true" className="mx-auto block h-px w-16 bg-gold" />
          <p className="mt-8 text-[clamp(1.15rem,2.2vw,1.6rem)] font-semibold leading-[1.42] tracking-[-0.02em] text-ink">
            {pain.closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
