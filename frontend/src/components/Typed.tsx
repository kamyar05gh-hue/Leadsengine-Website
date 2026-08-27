import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Milliseconds per character, and the longer beat after punctuation — a flat
 *  interval reads like a machine, this reads like a sentence. */
const CHAR_MS = 26;
const PUNCT_MS = 210;
/** Held before the first character, so the caret is seen waiting. */
const LEAD_IN_MS = 300;

const PUNCT = new Set([".", ",", ":", ";", "–", "—", "!", "?"]);

/**
 * Types `text` out character by character, once, the first time it is seen.
 *
 * The COMPLETE string is always in the DOM and is always the element that
 * sizes the box — it is only held at `opacity: 0` until the run finishes — so
 * nothing on the page reflows while the characters arrive, and a screen reader
 * is handed the whole sentence rather than a stutter of partial ones. The
 * characters that have landed are painted by an absolutely positioned,
 * `aria-hidden` overlay occupying exactly the same box.
 *
 * Under reduced motion the finished string renders on the first paint and the
 * effect returns before creating a single timer. The one pending timeout is
 * cleared on unmount and whenever the string changes (a language switch).
 */
export default function Typed({ text, className = "" }: { text: string; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.25, once: true });
  const [count, setCount] = useState(0);

  const shown = reduced ? text.length : count;
  const done = shown >= text.length;

  /* A language switch swaps the string; start the new one from zero. */
  useEffect(() => {
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (reduced || !inView) return;

    let timer = 0;
    let i = 0;

    const step = () => {
      i += 1;
      setCount(i);
      if (i >= text.length) return;
      timer = window.setTimeout(step, PUNCT.has(text.charAt(i - 1)) ? PUNCT_MS : CHAR_MS);
    };

    timer = window.setTimeout(step, LEAD_IN_MS);
    return () => window.clearTimeout(timer);
  }, [inView, reduced, text]);

  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      <span className={done ? undefined : "opacity-0"}>{text}</span>
      {done ? null : (
        <span aria-hidden="true" className="absolute inset-0">
          {text.slice(0, shown)}
          <span className="le-caret" />
        </span>
      )}
    </span>
  );
}
