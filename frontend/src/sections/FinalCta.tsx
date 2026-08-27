import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useInView } from "@/hooks/useInView";
import PrimaryCta from "@/components/PrimaryCta";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * The crescendo.
 *
 * The background used to be a concentric-ring instrument — an orrery. The
 * client's note was blunt and correct: a circle does not say "AI". It now
 * carries the one shape everybody reads as a model: a layered node field,
 * four columns of neurons wired to their nearest neighbours in the next
 * column, with signals propagating left to right through it. The page closes
 * on the thing the product actually does — a question entering a model and an
 * answer coming out the other side.
 *
 * It is AMBIENT TEXTURE and nothing more. There is no product mock-up, no
 * device frame, no dashboard, no panel and no UI chrome behind this headline
 * — the client asked for that removed and it must stay removed. What is here
 * is abstract: bare lines and dots at 0.2–0.3 alpha, structural blue for the
 * mesh, gold for the three paths a signal runs, and a soft radial mask that
 * thins the whole field out under the copy and fades it to nothing at every
 * edge. The headline and the button are the only assertive objects in the
 * section, and the field is complete and legible with no motion at all — the
 * packets only add life.
 *
 * ONE motion: three gold packets travelling the gold routes, on
 * incommensurable periods (8.4s / 11.7s / 15.1s) so they never pair up. They
 * are `animateMotion` — transform, nothing else — they are paused on the
 * document whenever the section is off screen, and under reduced motion they
 * are never rendered at all. The pointer parallax and the scroll-linked
 * counter-rotation that used to sit here are gone: they explained nothing.
 */

/* ------------------------------------------------------------------ */
/* The network — geometry resolved once, at module scope               */
/* ------------------------------------------------------------------ */

/* The view box is a wide band — close to the aspect the section actually
   occupies — so `slice` crops as little of the layered structure as possible
   on a desktop viewport. */
const VIEW_W = 1280;
const VIEW_H = 460;
const MID = VIEW_H / 2;

type Pt = { x: number; y: number };

/** Four columns: 4 → 6 → 6 → 3. The small vertical `shift` per column keeps
 *  the mesh from reading as a perfect grid. */
const COLUMNS = [
  { x: 100, count: 4, gap: 100, shift: 0 },
  { x: 460, count: 6, gap: 76, shift: -10 },
  { x: 820, count: 6, gap: 76, shift: 10 },
  { x: 1180, count: 3, gap: 112, shift: 0 },
] as const;

const NODES: Pt[][] = COLUMNS.map(({ x, count, gap, shift }) =>
  Array.from({ length: count }, (_, i) => ({
    x,
    y: MID + shift + (i - (count - 1) / 2) * gap,
  })),
);

/** Each node wires to the three nearest nodes in the next column. A full
 *  bipartite mesh turns to grey mush at this opacity; three reads as a
 *  network and still lets every line be seen. */
const FAN = 3;

const EDGES: [Pt, Pt][] = NODES.slice(0, -1).flatMap((col, c) =>
  col.flatMap((a) =>
    [...NODES[c + 1]]
      .sort((p, q) => Math.abs(p.y - a.y) - Math.abs(q.y - a.y))
      .slice(0, FAN)
      .map((b): [Pt, Pt] => [a, b]),
  ),
);

/** Three paths a signal takes through the mesh, as a node index per column.
 *  Every hop is one of the edges above — the routes never invent a wire. */
const ROUTES = [
  [0, 1, 1, 0],
  [2, 3, 4, 1],
  [3, 5, 3, 2],
] as const;

const ROUTE_PATHS = ROUTES.map((route) =>
  route
    .map((n, c) => `${c === 0 ? "M" : "L"} ${NODES[c][n].x} ${NODES[c][n].y}`)
    .join(" "),
);

/** Nodes that sit on a route are the warm ones — the path the eye follows. */
const LIT = new Set(ROUTES.flatMap((route) => route.map((n, c) => `${c}:${n}`)));

/** Seconds per packet, and when each one first sets off. */
const PACKET_DUR = [8.4, 11.7, 15.1] as const;
const PACKET_BEGIN = [0, 3.1, 6.6] as const;

/** Thins the mesh under the headline and fades it out at every edge, so the
 *  field never becomes a frame around the copy — and never competes with it. */
/* Two masks, intersected.
 *
 * The radial one holds the mesh away from the centre so the headline always
 * sits on clean ground. The linear one is the client's requested fade: the
 * field arrives out of nothing at the top edge of the section and dissolves
 * again at the bottom, so the section opens and closes rather than starting
 * and stopping. It is applied to the DECORATION only — no text on this page
 * ever fades, which is the rule the client set for the whole site. */
const FIELD_MASK = [
  "radial-gradient(80% 94% at 50% 50%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.4) 42%, rgba(0,0,0,0.8) 74%, rgba(0,0,0,0) 100%)",
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
].join(", ");

const FIELD: CSSProperties = {
  WebkitMaskImage: FIELD_MASK,
  maskImage: FIELD_MASK,
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

/** The same top-and-bottom fade for the aurora layer behind the mesh. */
const EDGE_FADE =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)";

const AURORA: CSSProperties = {
  WebkitMaskImage: EDGE_FADE,
  maskImage: EDGE_FADE,
};

/**
 * The title is one question with a break in the middle, marked by a comma
 * (an earlier version used a dash there; the copy no longer does, so the
 * comma is what this now looks for). Splitting after it gives the masked
 * reveal two balanced lines; a title without one simply reveals as a single
 * line.
 */
function titleLines(title: string): ReactNode[] {
  const match = /^(.*?[–—,-])\s+(.+)$/.exec(title.trim());
  if (!match) return [title];
  return [match[1], match[2]];
}

export default function FinalCta() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();

  const svgRef = useRef<SVGSVGElement>(null);

  /* `once: false` — the packets have to stop when the section leaves,
     otherwise a visitor sitting anywhere else on the page pays for three
     looping animations they cannot see. */
  const { ref: stageRef, inView } = useInView<HTMLDivElement>({
    once: false,
    threshold: 0,
    rootMargin: "0px",
  });
  const animate = !reduced && inView;

  /* SMIL ignores CSS play-state, so the packets are paused on the document. */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (animate) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [animate]);

  return (
    <section
      id="analyse"
      aria-labelledby="analyse-title"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg le-section"
    >
      {/* Light field, layer 1: slow drifting aurora, held back so the mesh
          stays the thing you notice. */}
      <div className="le-aurora opacity-25" style={AURORA} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Light field, layer 2: the model.

          `slice` crops whichever axis is over-long. On a desktop viewport the
          section is a wide band and the crop is vertical and small. On a
          phone the section is nearly square, and covering it would crop away
          all but a sliver of the width — so below `lg` the field is given a
          band of its own height, centred on the section, and the whole thing
          stays legible as a network instead of a few stray wires. */}
      <div
        ref={stageRef}
        aria-hidden="true"
        style={FIELD}
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[360px] -translate-y-1/2 lg:inset-0 lg:h-auto lg:translate-y-0"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {ROUTE_PATHS.map((d, i) => (
              <path key={i} id={`le-fc-route-${i}`} d={d} fill="none" />
            ))}
          </defs>

          {/* The mesh: every wire, structural blue, one weight. */}
          <g stroke="rgb(var(--le-accent-bright-rgb) / 0.16)" strokeWidth="1">
            {EDGES.map(([a, b], i) => (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            ))}
          </g>

          {/* The three wires a signal actually runs, in gold. Drawn whether or
              not anything is moving along them — the field reads at rest. */}
          <g fill="none" stroke="rgb(var(--le-gold-rgb) / 0.22)" strokeWidth="1">
            {ROUTE_PATHS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>

          {/* The neurons. */}
          {NODES.map((col, c) =>
            col.map((n, i) => {
              const lit = LIT.has(`${c}:${i}`);
              return (
                <circle
                  key={`${c}:${i}`}
                  cx={n.x}
                  cy={n.y}
                  r={lit ? 3.2 : 2.6}
                  fill={
                    lit
                      ? "rgb(var(--le-gold-bright-rgb) / 0.32)"
                      : "rgb(var(--le-accent-bright-rgb) / 0.24)"
                  }
                  stroke={
                    lit
                      ? "rgb(var(--le-gold-rgb) / 0.44)"
                      : "rgb(var(--le-accent-bright-rgb) / 0.34)"
                  }
                  strokeWidth="1"
                />
              );
            }),
          )}

          {/* The one motion: signals propagating through the model. */}
          {!reduced &&
            ROUTE_PATHS.map((_, i) => (
              <g key={i}>
                <circle r="8" fill="rgb(var(--le-gold-bright-rgb) / 0.08)" />
                <circle r="2.2" fill="rgb(var(--le-gold-bright-rgb) / 0.85)" />
                <animateMotion
                  dur={`${PACKET_DUR[i]}s`}
                  begin={`${PACKET_BEGIN[i]}s`}
                  repeatCount="indefinite"
                >
                  <mpath href={`#le-fc-route-${i}`} />
                </animateMotion>
                {/* Fades in as it leaves the input column and out as it
                    arrives, so the loop never snaps back. */}
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.07;0.86;1"
                  dur={`${PACKET_DUR[i]}s`}
                  begin={`${PACKET_BEGIN[i]}s`}
                  repeatCount="indefinite"
                />
              </g>
            ))}
        </svg>
      </div>

      <div className="le-container relative text-center">
        {/* A rule that draws out from the centre as the section arrives —
            the page's closing mark. Visible immediately under reduced motion. */}
        <span
          aria-hidden="true"
          className={`mx-auto mb-7 block h-px w-20 origin-center bg-accent-bright transition-transform duration-[900ms] [transition-timing-function:var(--le-ease-out)] ${
            inView || reduced ? "scale-x-100" : "scale-x-0"
          }`}
        />

        {/* The kicker the client asked for above the closing headline — same
            treatment as every other section, centred to match this one. */}
        <Reveal>
          <p className="le-kicker mb-5">{t.finalCta.kicker}</p>
        </Reveal>

        <h2
          id="analyse-title"
          className="mx-auto max-w-[20ch] text-[clamp(1.9rem,3.4vw,2.9rem)] font-semibold leading-[1.1] tracking-[-0.028em] text-ink"
        >
          <RevealText lines={titleLines(t.finalCta.title)} />
        </h2>

        <Reveal delay={140}>
          <p className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.65] text-ink-2">
            {t.finalCta.body}
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-10 flex justify-center">
            <PrimaryCta size="lg" label={t.finalCta.button} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
