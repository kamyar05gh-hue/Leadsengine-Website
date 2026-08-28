import type { ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

export type RevealDir = "up" | "down" | "left" | "right" | "scale" | "blur";

/**
 * Scroll-triggered reveal. Direction and delay are CSS-driven (see
 * `.reveal` in index.css) so nothing animates on the main thread but
 * transform and opacity.
 *
 * `eager` is for anything in the FIRST VIEWPORT. It keeps the movement and
 * drops the fade, because an element at `opacity: 0` is not counted as
 * painted by Largest Contentful Paint — a fade above the fold makes the page
 * measure as slow even when it rendered promptly. See the note on
 * `.reveal--eager` in index.css for the measurement.
 */
export default function Reveal({
  children,
  dir = "up",
  delay = 0,
  threshold = 0.15,
  className = "",
  eager = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  dir?: RevealDir;
  delay?: number;
  threshold?: number;
  className?: string;
  /** First-viewport content: move, but do not fade. See the note above. */
  eager?: boolean;
  as?: ElementType;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });

  return (
    <Tag
      ref={ref}
      data-dir={dir}
      className={`reveal ${eager ? "reveal--eager" : ""} ${inView ? "is-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
