import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Headline reveal: each line sits in an overflow-hidden mask and slides up
 * from below, staggered. The mask is padded (`.reveal-line`) so descenders
 * are never clipped.
 *
 * Pass `highlight` to color one line — index into `lines`.
 */
export default function RevealText({
  lines,
  className = "",
  delay = 0,
  stagger = 110,
  highlight,
  highlightClassName = "text-hi",
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  stagger?: number;
  highlight?: number;
  highlightClassName?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.15 });

  return (
    <span ref={ref} className={`reveal-lines ${inView ? "is-in" : ""} ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-line">
          <span
            className={i === highlight ? highlightClassName : undefined}
            style={{ transitionDelay: `${delay + i * stagger}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
