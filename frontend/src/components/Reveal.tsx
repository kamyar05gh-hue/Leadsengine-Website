import type { ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

export type RevealDir = "up" | "down" | "left" | "right" | "scale" | "blur";

/**
 * Scroll-triggered reveal. Direction and delay are CSS-driven (see
 * `.reveal` in index.css) so nothing animates on the main thread but
 * transform and opacity.
 */
export default function Reveal({
  children,
  dir = "up",
  delay = 0,
  threshold = 0.15,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  dir?: RevealDir;
  delay?: number;
  threshold?: number;
  className?: string;
  as?: ElementType;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });

  return (
    <Tag
      ref={ref}
      data-dir={dir}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
