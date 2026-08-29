import { useEffect, useRef } from "react";

/** Thin reading-progress rail pinned to the top of the viewport. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    /* ------------------------------------------------------------------
       THE SCROLL RANGE IS CACHED, AND THAT IS THE ENTIRE POINT OF THIS
       COMPONENT'S SHAPE.

       `document.documentElement.scrollHeight` is not a property read. It is a
       FORCED SYNCHRONOUS LAYOUT of the whole document: the browser must flush
       every pending style and lay out every box before it can answer. This
       used to sit inside `update()`, so the full page was re-laid out on
       every single frame the visitor scrolled.

       MEASURED on the live site at 390px / 4x CPU, one scroll to the bottom
       and back: 675 layouts and 1,600 style recalculations, and the counters
       climbed on every further pass. It is also exactly why scrolling BACK
       felt worse than scrolling down — on the way down much of the page has
       not been revealed yet, so there is less to lay out; by the time you
       turn around, every reveal below you has fired and the flush now covers
       the whole materialised document, once per frame.

       The number it was paying that for barely moves. Page height changes
       when the window resizes, when an image or font lands, or when a reveal
       changes an element's height — never mid-scroll-frame. So it is read
       once, and re-read on the two events that can actually change it. The
       ResizeObserver is what catches the reveals: it fires when the body's
       box changes, which is precisely when the cached value went stale.
       ------------------------------------------------------------------ */
    let max = 0;
    const remeasure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };

    const update = () => {
      raf = 0;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onResize = () => {
      remeasure();
      onScroll();
    };

    remeasure();
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    /* Reading layout inside a ResizeObserver callback is free — it runs after
       layout has already been computed for the frame, so there is nothing to
       flush. Guarded because older Safari shipped without it; there the
       resize listener alone still keeps the rail honest. */
    const ro =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            remeasure();
            onScroll();
          })
        : null;
    ro?.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="le-progress" style={{ transform: "scaleX(0)" }} aria-hidden="true" />;
}
