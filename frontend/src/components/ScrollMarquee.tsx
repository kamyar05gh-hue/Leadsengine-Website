import { useEffect, useRef, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * A continuous loop that iOS can actually render.
 *
 * WHY THIS EXISTS, WITH THE MEASUREMENT.
 * The desktop bands loop by translating one very wide track by -50%. That is
 * the cheapest possible animation — the compositor moves a cached layer and
 * the main thread does nothing — right up until the layer will not fit. At a
 * 390px viewport the logo track is ~12,800 CSS px, and an iPhone renders at
 * devicePixelRatio 3, so the texture the compositor is asked for is ~38,000
 * DEVICE pixels wide. iOS Safari's maximum texture dimension is 4,096-16,384
 * depending on the chip. It does not fail loudly: it drops the layer out of
 * hardware compositing and repaints the whole 12,800px element on the CPU
 * every frame, forever, which is what made the site crawl on iPhones.
 *
 * Making the band static below `md` fixed the performance and lost the loop,
 * which the client wants. So this is the third option: SCROLL the row instead
 * of transforming it.
 *
 * A scroll container only ever rasterises what is visible plus a small
 * margin. There is no oversized layer to allocate at any track width, so the
 * cost is flat no matter how many logos are in the row — the exact property
 * the transform version does not have. The price is one `scrollLeft` write
 * per frame on the main thread, which is a rounding error next to repainting
 * 12,800px.
 *
 * DETAILS THAT MATTER
 *
 *   TWO COPIES, WRAP AT HALF. `scrollWidth / 2` is exactly one copy, so
 *   subtracting it lands on a pixel-identical frame. No seam, no reset jump.
 *
 *   TIME-BASED, NOT FRAME-BASED. Speed is px per SECOND and each step
 *   multiplies by the real frame delta, so the band travels at the same rate
 *   on a 120Hz iPhone as on a throttled 30fps one. The delta is clamped at
 *   64ms so returning to a backgrounded tab does not teleport the row.
 *
 *   `overflow-x: hidden` STILL SCROLLS PROGRAMMATICALLY. It is used rather
 *   than `auto` so a finger cannot fight the animation, and it keeps the
 *   scrollbar off a decorative element.
 *
 *   PAUSED OFF SCREEN, and not started at all under reduced motion — where
 *   the row simply sits still and stays completely readable.
 */
export default function ScrollMarquee({
  children,
  /** Pixels per second. Matched to the desktop bands by eye. */
  speed = 55,
  className = "",
  ariaLabel,
}: {
  /** ONE copy of the row. It is rendered twice; the second is aria-hidden. */
  children: ReactNode;
  speed?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  /* Positive margins, so the loop is already running before the band scrolls
     into view and only stops well after it leaves — the same reasoning as the
     desktop bands, where a shrunken bottom edge once froze the row on screen. */
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0,
    once: false,
    rootMargin: "250px 0px 250px 0px",
  });

  useEffect(() => {
    if (reduced || !inView) return;
    const el = scroller.current;
    if (!el) return;

    let raf = 0;
    let last = 0;

    const step = (now: number) => {
      if (last !== 0) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          const dt = Math.min(now - last, 64);
          let next = el.scrollLeft + (speed * dt) / 1000;
          if (next >= half) next -= half;
          el.scrollLeft = next;
        }
      }
      last = now;
      raf = window.requestAnimationFrame(step);
    };

    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [inView, reduced, speed]);

  return (
    <div ref={ref} aria-label={ariaLabel} className={className}>
      <div
        ref={scroller}
        /* `scroll-behavior: auto` explicitly: a global `smooth` would turn
           every one-pixel step into an animation and the row would crawl. */
        className="w-full overflow-x-hidden [scroll-behavior:auto]"
      >
        <div className="flex w-max">
          {children}
          <div aria-hidden="true" className="flex">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
