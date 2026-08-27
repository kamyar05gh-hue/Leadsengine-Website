import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver wrapper. Returns a ref to attach and whether the
 * element has entered the viewport. `once` (default) disconnects after the
 * first entry so reveals never replay on scroll-back; `once: false` keeps
 * reporting, which is what the animated visuals use to pause off-screen.
 *
 * The effect re-checks the node on the next frames if it is not attached on
 * the first run. Without that, an element that mounts a tick later (a lazy
 * section, a StrictMode remount, a conditional branch) would never get an
 * observer at all — and for an `once: false` consumer that silently disables
 * the pausing it relies on, leaving expensive animation running off-screen.
 *
 * THE DEFAULT `rootMargin` IS TUNED FOR REVEALS, NOT FOR PAUSING.
 * `-8%` on the bottom holds a reveal back until the element is properly on
 * screen rather than firing the instant one pixel appears. A pause-when-
 * off-screen consumer must NOT inherit it: the shrunken bottom edge reports
 * the element as out of view while it is still visible, which froze both logo
 * marquees mid-scroll. Those pass an explicit positive margin instead — see
 * the note in `TrustedBy.tsx`. If you add another `once: false` consumer that
 * drives an animation, do the same.
 */
export function useInView<T extends HTMLElement>(
  { threshold = 0.15, rootMargin = "0px 0px -8% 0px", once = true } = {},
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let raf = 0;
    let attempts = 0;

    const attach = () => {
      raf = 0;
      const el = ref.current;

      if (!el) {
        // Bounded retry — a handful of frames is plenty for a late mount,
        // and the cap stops a never-attached ref spinning forever.
        if (attempts++ < 10) raf = requestAnimationFrame(attach);
        return;
      }

      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io?.disconnect();
          } else if (!once) {
            setInView(false);
          }
        },
        { threshold, rootMargin },
      );

      io.observe(el);
    };

    attach();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
