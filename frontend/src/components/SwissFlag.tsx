/**
 * The Swiss flag.
 *
 * Lifted out of `Hero.tsx`, where it was a local helper, once the proof band
 * needed the same mark: two hand-drawn copies of a national flag is exactly
 * the kind of thing that drifts a pixel apart and then looks wrong in one
 * place for months.
 *
 * The red is deliberately literal and not a palette token: it is the national
 * colour, a fact like the phone number, not site chrome. `rx` is set in
 * viewBox units so the rounded corner survives browsers that do not clip an
 * SVG root by `border-radius`.
 *
 * `className` carries the size, so a caller picks the box and nothing here
 * has to know about it.
 */
export default function SwissFlag({ className = "h-[14px] w-[14px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={`block shrink-0 rounded-[3px] ${className}`}
    >
      <rect width="32" height="32" rx="6.9" ry="6.9" fill="#d52b1e" />
      <rect x="6" y="13" width="20" height="6" fill="#ffffff" />
      <rect x="13" y="6" width="6" height="20" fill="#ffffff" />
    </svg>
  );
}
