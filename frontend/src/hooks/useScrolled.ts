import { useEffect, useState } from "react";

export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  /* rAF-throttled, and it only calls into React when the ANSWER changes.
     The naive version dispatched a state update on every scroll event — a
     couple of hundred per second on a trackpad or a flicked phone. React
     bails out of the re-render when the value is identical, but the bail-out
     is not free: it still enters the scheduler on every one of them, on the
     same main thread the scroll is trying to use. */
  useEffect(() => {
    let raf = 0;
    let last: boolean | null = null;

    const update = () => {
      raf = 0;
      const next = window.scrollY > threshold;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);

  return scrolled;
}
