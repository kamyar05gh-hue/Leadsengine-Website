import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { PlatformMark } from "@/components/ChatMockup";
import { LogoMark } from "@/components/Logo";
import { STREAMS_BACK, STREAMS_FRONT, STREAM_DOTS } from "@/components/heroStreams";

/*
 * The hero engine — a coded replica of the client's reference clip.
 *
 * WHAT IS COPIED, AND HOW. Nothing here is eyeballed from the clip:
 *
 *   LINES. trace_lines.py keys the glow out of the artwork, thins it to
 *   single-pixel skeletons, walks those into strokes and fits curves. So the
 *   lines sit exactly where the clip's lines sit — a bundle pouring into the
 *   disc's left face and a crescent of nested arcs wrapping the nacelle's
 *   right side, with the upper left bare. That asymmetry IS the artwork; an
 *   earlier pass replaced it with an even 360-degree spread and was wrong.
 *   Each is then extended along its own end tangents, which lengthens a line
 *   without moving it.
 *
 *   PILLS. Placed at the clip's own pill positions, mapped through the same
 *   transform as the lines. But they carry the REAL platform marks and the
 *   site's own names — the clip has "Gemini" and "A.G.I." painted into its
 *   pixels, which contradict the platform list the rest of the page uses.
 *
 * WHAT IS IMPROVED.
 *   · the marks are live SVG, so they stay sharp at any size, unlike the
 *     clip's baked-in raster labels
 *   · the lines carry travelling light; the clip's are static
 *   · a GOLDEN SWEEP is thrown off the engine as it turns, which the clip
 *     does not have
 *   · the blades actually turn — the clip's engine is frozen (four
 *     consecutive frames are pixel-identical)
 *
 * THE ENGINE IS ONE OBJECT. The plate is never cut. `engine-spin.webm` is an
 * overlay rendered offline from this same plate with the feathered blend baked
 * into its ALPHA, so the browser's `static * (1 - a) + spin * a` is exactly
 * the offline composite — a soft ramp, not a clip, and no visible circle.
 *
 * TWO THINGS THAT MADE EARLIER SPINS LOOK FAKE, both fixed in spin3.py:
 *   · ROTATING LIGHT. The render is lit — warm at the bottom of the disc,
 *     cool at the top left, a highlight on the hub's rim. Rotating the pixels
 *     rotated that lighting, and moving light reads as a separate object. Now
 *     a wide blur of the plate is taken as its lighting, only the remaining
 *     geometry turns, and it is laid back under the static lighting.
 *   · THE WAGON WHEEL. blades.py finds no clean blade count (N=18 carries 2%
 *     of the angular spectrum, with 17/19/20/21 equally weak), so a full 360
 *     is unavoidable. A pitch is ~19 degrees and the old build stepped 7.5 a
 *     frame with only 4.5 of blur, so the eye matched each blade to its
 *     NEIGHBOUR and saw a stutter. The blur now spans a whole pitch, which
 *     merges each blade into the next — there is no longer a blade to alias,
 *     and it is what a fan turning this fast looks like through a shutter.
 */

const VW = 900;
const VH = 780;

/** Where the render's hub is placed in the scene. */
const CX = 430;
const CY = 350;

/** The hub's position and diameter inside engine-body.webp (948 x 948). */
const HUB_X = 31.224;
const HUB_Y = 50.844;
const HUB_D_PCT = 23.629;
/** Foreshortening of the hub ellipse (112 / 160). */
const K_HUB = 0.7;

/** Engine width as a share of the scene box. */
const ENGINE_W = 60;

const TONE = {
  B: "var(--le-accent-bright-rgb)",
  C: "var(--le-cyan-rgb)",
  G: "var(--le-gold-bright-rgb)",
} as const;

/**
 * The clip's own pill positions, mapped into scene units by the transform
 * that mapped the lines: scene = 430 + (x - 536) * 0.816, 350 + (y - 420) *
 * 0.798. The clip has six pills; five are used, because the site has five
 * platforms and none of them is the clip's "A.G.I.".
 * `anchor` is where the connector meets the engine.
 */
const CARRIERS = [
  { d: "M404 214C400 178 398 140 397 108", at: [397, 96], t: "C" },
  { d: "M596 258C668 226 760 200 828 186", at: [840, 182], t: "C" },
  { d: "M600 452C664 484 740 516 800 538", at: [812, 544], t: "B" },
  { d: "M392 512C394 540 396 562 398 582", at: [398, 592], t: "C" },
  { d: "M286 316C246 308 200 296 158 286", at: [146, 282], t: "B" },
] as const;

type Filament = {
  d: string;
  t: string;
  w: number;
  o: number;
  /** Seconds for one pass. */
  s: number;
  /** Stagger, so the field never pulses in unison. */
  b: number;
  k: "field" | "arc";
};

const px = (x: number) => `${((x / VW) * 100).toFixed(3)}%`;
const py = (y: number) => `${((y / VH) * 100).toFixed(3)}%`;

export default function HeroEngine({ className = "" }: { className?: string }) {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05, once: false });
  const svgRef = useRef<SVGSVGElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  /* LITE MODE — phones and other low-power devices.
     `stroke-dashoffset` is rasterised on the CPU every single frame, so the
     line field is the whole cost of this scene. On a desktop that is free;
     measured on a phone-class CPU (360px, 6x throttle) the full field ran at
     25 fps with 155 of 179 frames over 32ms, which is the lag and heaviness
     on mobile. Lite mode keeps every third line and renders each with two
     paths instead of three, taking ~99 animated paths down to ~22. The
     composition still reads the same because the traced lines run in dense
     near-parallel groups — thinning them keeps the shape and loses the
     crowding. */
  const [lite, setLite] = useState(false);

  /* STILL MODE — and thinning was not enough.
     PROFILED AGAIN on the LIVE site at 390px / 6x CPU: 53 animations running
     at once, 27 of them `le-comet` on <path> and 16 `le-twinkle` on <circle>.
     `stroke-dashoffset` cannot be composited, so each of those 27 paths is
     re-rasterised on the CPU every frame — for as long as the tab is open.
     The main-thread JS in the same profile was 24ms in four seconds; the
     cost was almost entirely browser style/paint, which is exactly the shape
     of "fine on a laptop, heavy on a phone".

     So on a coarse pointer the line field STOPS MOVING. The lines are still
     drawn, with the same geometry, colours and glow — only the light no
     longer travels along them, and the specks no longer twinkle. What is
     left animating is `le-bloom`, `le-breathe`, `le-ring`, `le-blades` and
     `le-float`: nine animations, all `transform`/`opacity`, all composited,
     none of which touch the CPU per frame.

     Desktop is untouched and keeps the full scene. */
  const still = lite;

  const running = reduced ? false : inView;
  const state = running ? ("running" as const) : ("paused" as const);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduced) return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView, reduced]);

  /** Eased pointer attitude, written straight to the node — no React renders. */
  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!inView) return;

    const el = sceneRef.current;
    if (!el) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const t0 = performance.now();

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };

    const tick = (now: number) => {
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      const drift = Math.sin((now - t0) / 3000) * 2.2;
      el.style.transform = `rotateX(${(-cy * 9).toFixed(2)}deg) rotateY(${(
        cx * 16 +
        drift
      ).toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, inView]);

  useEffect(() => {
    /* Viewport and pointer only. `hardwareConcurrency` looked like a good
       extra signal and is not one: this desktop reports 4 and was being put
       into lite mode, while plenty of budget phones report 8. The media
       query targets the actual case directly. */
    const small = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const apply = () => setLite(small.matches);
    apply();
    small.addEventListener("change", apply);
    return () => small.removeEventListener("change", apply);
  }, []);

  const platforms = t.hero.platforms;

  const backLines = lite ? STREAMS_BACK.filter((_, i) => i % 3 === 0) : STREAMS_BACK;
  const frontLines = lite ? STREAMS_FRONT.filter((_, i) => i % 3 === 0) : STREAMS_FRONT;
  const specks = lite ? STREAM_DOTS.filter((_, i) => i % 2 === 0) : STREAM_DOTS;

  /* `still` short-circuits exactly like `reduced` does, except the element
     stays fully visible — the line is drawn, it simply does not travel. */
  const anim = (name: string, dur: number, delay: number) =>
    reduced
      ? ({ opacity: 0 } as const)
      : still
        ? ({ opacity: 0 } as const)
        : ({
          animationName: name,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
          animationPlayState: state,
        } as const);

  /**
   * Every line now LEAVES the engine, so the light travels outward along it.
   *
   * Dash period 1.6 on a path of length 1, driven by `le-comet`
   * (offset 0.5 → -1.1, also 1.6): a single dash starts before the path,
   * crosses it, and is past the end before the pattern repeats — born,
   * travels, dies. The period MUST exceed 1 + dash, or a second dash follows
   * the first onto the path and the light appears to jump back, which is what
   * an earlier build did and what read as "laggy".
   */
  const strand = (f: Filament, i: number, key: string) => {
    const tone = TONE[f.t as keyof typeof TONE] ?? TONE.B;
    /* Two paths for the shorter strokes, three for the long ones — the extra
       glow pass is the widest stroke and therefore the most expensive, so on
       a phone every line takes the two-path route. */
    if (f.k === "arc" || lite) {
      return (
        <g key={`${key}-${i}`}>
          <path
            d={f.d}
            stroke={`rgb(${tone} / ${(f.o * 0.7).toFixed(3)})`}
            strokeWidth={f.w}
            strokeLinecap="round"
          />
          <path
            d={f.d}
            pathLength={1}
            stroke={`rgb(${tone})`}
            strokeWidth={f.w * 1.9}
            strokeLinecap="round"
            strokeDasharray="0.16 1.44"
            style={anim("le-comet", f.s, f.b)}
          />
        </g>
      );
    }
    return (
      <g key={`${key}-${i}`}>
        <path
          d={f.d}
          stroke={`rgb(${tone} / ${(f.o * 0.85).toFixed(3)})`}
          strokeWidth={f.w}
          strokeLinecap="round"
        />
        <path
          d={f.d}
          pathLength={1}
          stroke={`rgb(${tone} / ${(f.o * 0.5).toFixed(3)})`}
          strokeWidth={f.w * 3.4}
          strokeLinecap="round"
          strokeDasharray="0.22 1.38"
          style={anim("le-comet", f.s, f.b + f.s * 0.04)}
        />
        <path
          d={f.d}
          pathLength={1}
          stroke={`rgb(${tone})`}
          strokeWidth={f.w * 1.6}
          strokeLinecap="round"
          strokeDasharray="0.14 1.46"
          style={anim("le-comet", f.s, f.b)}
        />
      </g>
    );
  };

  const filaments = (arr: readonly Filament[], key: string) => (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="h-full w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none">{arr.map((f, i) => strand(f, i, key))}</g>
    </svg>
  );

  /** The bright specks along the lines — a defining feature of the artwork. */
  const particles = (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="h-full w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      {specks.map((p, i) => {
        const tone = TONE[p.t as keyof typeof TONE] ?? TONE.B;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={`rgb(${tone})`}
            style={
              /* Still on a phone, for the same reason as the comets — sixteen
                 of these were animating opacity on <circle> elements inside
                 an SVG that is already re-rasterising. They keep their light,
                 they just hold it. */
              reduced || still
                ? { opacity: 0.55 }
                : {
                    animationName: "le-twinkle",
                    animationDuration: `${2.4 + (i % 7) * 0.5}s`,
                    animationDelay: `${(i % 11) * 0.31}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDirection: "alternate",
                    animationPlayState: state,
                  }
            }
          />
        );
      })}
    </svg>
  );

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ aspectRatio: `${VW} / ${VH}`, containerType: "inline-size" }}
    >
      <div
        className="absolute inset-0"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 45%" }}
      >
        <div
          ref={sceneRef}
          className="le-hero-scene absolute inset-0"
          /* NO inline `transform` unless the pointer actually drives it.
             This used to set `rotateY(0deg)` whenever the pointer was idle,
             which silently overrode the stylesheet's mobile centring
             (`.le-hero-scene { transform: translateX(...) }`) — an inline
             transform beats a class rule — so the engine sat off-centre on
             phones and the right-hand pills hung past the screen edge. */
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* --- bloom, furthest back --- */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: px(CX),
              top: py(CY),
              width: "84cqw",
              height: "84cqw",
              transform: "translate(-50%, -50%) translateZ(-120px)",
              background:
                "radial-gradient(circle, rgb(var(--le-accent-bright-rgb) / 0.26), rgb(var(--le-gold-rgb) / 0.1) 42%, transparent 70%)",
              ...(reduced
                ? null
                : {
                    animationName: "le-bloom",
                    animationDuration: "7s",
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDirection: "alternate",
                    animationPlayState: state,
                  }),
            }}
          />

          {/* --- the lines that leave the engine BEHIND it --- */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ transform: "translateZ(-60px)" }}
          >
            {filaments(backLines, "b")}
          </div>

          {/* --- the engine: ONE image, animated as one object --- */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: px(CX),
              top: py(CY),
              width: `${ENGINE_W}cqw`,
              aspectRatio: "1 / 1",
              transform: `translate(${-HUB_X}%, ${-HUB_Y}%)`,
            }}
          >
            <div
              className="relative h-full w-full"
              style={{
                /* ISOLATE. `hard-light` blends with everything below it in the
                   stacking context, and below the engine sit the bloom and
                   the page ground — so without this the blades blended with
                   the blue/gold glow behind them and came out hot orange
                   instead of dark metal. Isolating confines the blend to the
                   plate, which is the only thing it is meant to modulate. */
                isolation: "isolate",
                ...(reduced
                  ? null
                  : {
                      animationName: "le-breathe",
                      animationDuration: "9s",
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDirection: "alternate",
                      animationPlayState: state,
                    }),
              }}
            >
              {/* The hero's LCP element. It is fetched eagerly at high
                  priority, so its WEIGHT is felt directly in how fast the
                  page appears — and on a 360px screen this renders about
                  180px wide, so serving the full 948px plate meant a phone
                  downloading roughly five times the pixels it could show, on
                  the connection least able to afford it. `sizes` describes
                  the real rendered width at each breakpoint so the browser
                  picks the smallest file that still covers the device's
                  pixel ratio: 117KB instead of 333KB on a phone. */}
              {/* MEDIA-SCOPED <picture>, not srcset+sizes. On a 360px screen
                  this renders ~194px wide, so the full 948px plate was five
                  times the pixels a phone can show — and density selection
                  kept resolving to it anyway even with correct `sizes`, so
                  the phone downloaded 333KB (and briefly 450KB, fetching two
                  plates). Explicit media conditions are deterministic: each
                  viewport gets exactly one file, 117KB on a phone. The
                  conditions here MUST stay in step with the preloads in
                  index.html, or the page fetches one plate and displays
                  another. */}
              <picture>
                <source media="(max-width: 640px)" srcSet="/images/engine-body-480.webp" />
                <source
                  media="(min-width: 641px) and (max-width: 1023px)"
                  srcSet="/images/engine-body-680.webp"
                />
                <img
                  src="/images/engine-body.webp"
                  alt=""
                  width={948}
                  height={948}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="absolute inset-0 h-full w-full select-none"
                />
              </picture>

              {/* THE BLADES, TURNING. One still, rotated continuously on the
                  GPU — see `le-blades`. It carries only the blade GEOMETRY:
                  the plate's own lighting was divided out, so `hard-light`
                  puts the detail back over the STATIC lighting underneath and
                  the warm glow at the bottom of the disc never travels. The
                  hub's rim, the core and the monogram sit inside the mask's
                  inner edge and are untouched plate pixels. */}
              {/* MEDIA-SCOPED, FOR EXACTLY THE REASON THE BODY PLATE ABOVE IS.

                  This one was left on srcset+sizes and caught the same
                  disease, which MEASURING the live page finally made
                  obvious. `sizes="(max-width: 1023px) 60vw"` is 234 CSS px on
                  a 390px phone, but that phone has devicePixelRatio 3, so the
                  browser needs 702 device px and dutifully picks the 948w
                  file. A phone downloaded 43.9KB where 16.3KB covers it.

                  Worse, this is the LCP ELEMENT. Traced on 4G with a 4x CPU
                  throttle, it was not even DISCOVERED until 1758ms — the
                  parser has to reach this tag, which is inside a React tree
                  that has to boot first — and it finished painting at 3832ms.
                  Meanwhile all nineteen logo plates began downloading at
                  1856ms and competed with it for a 1.6Mbps pipe.

                  So: explicit media conditions (deterministic, one file per
                  viewport) plus a preload in index.html so the fetch starts
                  with the document instead of after the bundle. The
                  conditions here MUST stay in step with those preloads, or
                  the page fetches one plate and displays another. */}
              <picture>
                <source
                  media="(max-width: 640px)"
                  srcSet="/images/engine-blades-480.webp"
                />
              <img
                src="/images/engine-blades.webp"
                alt=""
                aria-hidden="true"
                width={948}
                height={948}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full select-none"
                style={{
                  mixBlendMode: "hard-light",
                  transformOrigin: `${(322 / 948) * 100}% ${(475 / 948) * 100}%`,
                  ...(reduced
                    ? null
                    : {
                        animationName: "le-blades",
                        animationDuration: "3.2s",
                        animationTimingFunction: "linear",
                        animationIterationCount: "infinite",
                        animationPlayState: state,
                        willChange: "transform",
                      }),
                }}
              />
              </picture>


              {/* The hub's glowing ring — the clip's core is edged with one,
                  and it is what makes the core read as lit from within. */}
              <div
                aria-hidden="true"
                className="absolute rounded-full"
                style={{
                  left: `${HUB_X}%`,
                  top: `${HUB_Y}%`,
                  width: `${HUB_D_PCT * 1.03}%`,
                  height: `${(HUB_D_PCT / K_HUB) * 1.03}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow:
                    "0 0 0 1px rgb(var(--le-cyan-rgb) / 0.85), 0 0 14px 1px rgb(var(--le-cyan-rgb) / 0.55), inset 0 0 16px 2px rgb(var(--le-cyan-rgb) / 0.35)",
                  ...(reduced
                    ? null
                    : {
                        animationName: "le-ring",
                        animationDuration: "3.8s",
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDirection: "alternate",
                        animationPlayState: state,
                      }),
                }}
              />

              {/* The REAL monogram, on the hub, squashed onto its plane. */}
              <div
                className="absolute"
                style={{
                  left: `${HUB_X}%`,
                  top: `${HUB_Y}%`,
                  width: `${HUB_D_PCT * 0.78}%`,
                  marginLeft: `${(-HUB_D_PCT * 0.78) / 2}%`,
                  transform: `translateY(-50%) scaleX(${K_HUB})`,
                }}
              >
                <LogoMark size={40} className="h-auto w-full" />
              </div>
            </div>
          </div>

          {/* --- the bundle's entry glow, where it meets the disc --- */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: px(CX - 72),
              top: py(CY + 6),
              width: "16cqw",
              height: "16cqw",
              transform: "translate(-50%, -50%) translateZ(44px)",
              background:
                "radial-gradient(circle, rgb(var(--le-cyan-rgb) / 0.34), rgb(var(--le-cyan-rgb) / 0.1) 40%, transparent 66%)",
              ...(reduced
                ? null
                : {
                    animationName: "le-bloom",
                    animationDuration: "4.2s",
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDirection: "alternate",
                    animationPlayState: state,
                  }),
            }}
          />

          {/* --- the lines that leave the engine IN FRONT of it --- */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ transform: "translateZ(50px)" }}
          >
            {filaments(frontLines, "f")}
          </div>

          {/* --- the particles riding on them --- */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ transform: "translateZ(58px)" }}
          >
            {particles}
          </div>

          {/* --- the connectors: engine to pill, a dot gliding along --- */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ transform: "translateZ(64px)" }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VW} ${VH}`}
              className="h-full w-full overflow-visible"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                {CARRIERS.map((c, i) => (
                  <path key={i} id={`le-carry-${i}`} d={c.d} />
                ))}
              </defs>
              <g fill="none" strokeLinecap="round">
                {CARRIERS.map((c, i) => {
                  const tone = TONE[c.t as keyof typeof TONE];
                  return (
                    <g key={i}>
                      <path d={c.d} stroke={`rgb(${tone} / 0.08)`} strokeWidth="5" />
                      <path d={c.d} stroke={`rgb(${tone} / 0.4)`} strokeWidth="1" />
                      <circle cx={c.at[0]} cy={c.at[1]} r="6.5" fill={`rgb(${tone} / 0.22)`} />
                      <circle cx={c.at[0]} cy={c.at[1]} r="2.4" fill={`rgb(${tone})`} />
                      <circle r="2.2" fill={`rgb(${tone})`}>
                        {!reduced && (
                          <animateMotion
                            dur={`${3.2 + i * 0.35}s`}
                            begin={`${i * 0.7}s`}
                            repeatCount="indefinite"
                          >
                            <mpath href={`#le-carry-${i}`} />
                          </animateMotion>
                        )}
                        {!reduced && (
                          <animate
                            attributeName="opacity"
                            values="0;1;1;0"
                            keyTimes="0;0.12;0.8;1"
                            dur={`${3.2 + i * 0.35}s`}
                            begin={`${i * 0.7}s`}
                            repeatCount="indefinite"
                          />
                        )}
                      </circle>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* --- the pills: the clip's positions, the site's real platforms --- */}
          {CARRIERS.map((c, i) => {
            const name = platforms[i];
            if (!name) return null;
            const tone = TONE[c.t as keyof typeof TONE];
            return (
              <div
                key={name}
                className="absolute"
                style={{
                  left: px(c.at[0]),
                  top: py(c.at[1]),
                  transform: "translate(-50%, -50%) translateZ(86px)",
                }}
              >
                <div
                  /* Tighter on phones: at 360px the five pills plus the
                     engine spanned 354 of 360 available, so the group sat
                     inside a 3px margin and read as touching the edges. */
                  className="flex items-center gap-1.5 rounded-full bg-bg/80 px-2 py-1 backdrop-blur-md sm:gap-2.5 sm:px-3.5 sm:py-2"
                  style={{
                    border: `1px solid rgb(${tone} / 0.5)`,
                    boxShadow: `0 0 28px -8px rgb(${tone} / 0.75)`,
                    ...(reduced
                      ? null
                      : {
                          animationName: "le-float",
                          animationDuration: `${5.2 + i * 0.6}s`,
                          animationDelay: `${i * 0.42}s`,
                          animationTimingFunction: "ease-in-out",
                          animationIterationCount: "infinite",
                          animationDirection: "alternate",
                          animationPlayState: state,
                        }),
                  }}
                >
                  <PlatformMark
                    name={name}
                    className="h-[13px] w-[13px] shrink-0 sm:h-[18px] sm:w-[18px]"
                    style={{ color: `rgb(${tone})` }}
                  />
                  <span className="whitespace-nowrap text-[10.5px] font-medium leading-none tracking-[-0.01em] text-ink sm:text-[13px]">
                    {name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
