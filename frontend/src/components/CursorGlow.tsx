import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const INTERACTIVE = 'a, button, [role="button"], input, summary, label, .le-magnetic';

/**
 * Pointer spotlight: a wide soft light wash, a lagging ring and a dot that
 * tracks exactly. The ring expands over interactive elements.
 *
 * Everything runs inside one rAF loop writing only `transform`, so it never
 * triggers layout. Disabled on touch/coarse pointers and reduced motion.
 */
export default function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const lightRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const wrap = wrapRef.current;
    const light = lightRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!wrap || !light || !ring || !dot) return;

    // target = true pointer position; ring/light lag behind it.
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let lx = tx;
    let ly = ty;
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        wrap.style.opacity = "1";
      }
      const target = e.target as Element | null;
      ring.dataset.active = String(Boolean(target?.closest(INTERACTIVE)));
    };

    const onLeave = () => {
      visible = false;
      wrap.style.opacity = "0";
    };

    const tick = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      lx += (tx - lx) * 0.07;
      ly += (ty - ly) * 0.07;

      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      light.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ opacity: 0, transition: "opacity 400ms ease" }}
    >
      <div ref={lightRef} className="le-cursor le-cursor-light" />
      <div ref={ringRef} className="le-cursor le-cursor-ring" />
      <div ref={dotRef} className="le-cursor le-cursor-dot" />
    </div>
  );
}
