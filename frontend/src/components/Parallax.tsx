import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Translates its children against scroll while they are on screen.
 * `speed` is the fraction of scroll distance to offset by — positive drifts
 * up (slower than the page), negative drifts down.
 */
export default function Parallax({
  children,
  speed = 0.12,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let onScreen = false;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      // Distance of the element's centre from the viewport centre.
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (onScreen && !raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) onScroll();
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(el);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, reduced]);

  return (
    <div ref={ref} className={className} style={{ willChange: reduced ? undefined : "transform" }}>
      {children}
    </div>
  );
}
