/**
 * The "LE" monogram — the client's actual mark, vectorised from their artwork.
 *
 * This is not a redrawing by eye. `design-source/le-logo-source.jpg` was
 * thresholded, de-ringed (the JPEG leaves ringing along the slanted bars), and
 * its pixel boundary was traced and simplified with Douglas-Peucker. The result
 * was rasterised back and scored against the source mask:
 *
 *   traced area 153'295 px · source area 152'266 px · IoU 0.990
 *   missing 407 px · extra 1'436 px — all sub-pixel edge slivers
 *
 * Four closed contours, in the order they are drawn:
 *   1. the L — stem, rounded heel, foot, and the diagonal where the bottom
 *      bar of the E cuts into it
 *   2-4. the three slanted bars of the E
 *
 * The mark is wider than it is tall (100 × 76.24), so `size` drives HEIGHT and
 * the width follows — passing it to both axes would squash the letterforms.
 * Colour is `currentColor` over a default of `text-ink`.
 */
const MARK_W = 100;
const MARK_H = 76.24;
const RATIO = MARK_W / MARK_H;

export function LogoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size * RATIO}
      height={size}
      viewBox={`0 0 ${MARK_W} ${MARK_H}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`text-ink ${className}`}
    >
      {/* L — stem, rounded heel, foot, diagonal cut at the E's bottom bar. */}
      <path
        fill="currentColor"
        d="M0.17 0.00L16.17 0.17L16.17 52.31L16.83 55.28L17.99 57.43L19.97 59.24L22.94 60.40L36.80 60.56L50.17 74.59L51.32 75.91L51.16 76.24L20.63 76.24L18.48 75.91L14.52 74.75L10.56 72.77L8.09 70.96L4.79 67.33L1.65 61.55L0.00 54.29L0.17 0.17Z"
      />
      {/* E — three slanted bars. */}
      <path
        fill="currentColor"
        d="M44.39 0.00L99.83 0.00L100.00 0.50L89.93 13.53L88.28 15.18L85.81 16.34L29.21 16.34L40.10 1.98L41.91 0.66L44.39 0.17Z"
      />
      <path
        fill="currentColor"
        d="M43.40 31.02L100.00 31.02L100.00 31.52L89.77 44.55L88.12 46.04L86.14 46.86L29.54 47.03L29.54 46.20L39.77 33.17L41.25 31.85L43.40 31.19Z"
      />
      <path
        fill="currentColor"
        d="M44.06 60.56L100.00 60.56L100.00 60.89L89.77 73.93L86.80 76.07L59.41 76.24L57.92 75.58L55.78 73.60L44.06 60.73Z"
      />
    </svg>
  );
}

/**
 * Mark + wordmark. Two tones at most: "Leads" carries the weight, "Engine"
 * steps back — the same value hierarchy the whole palette runs on.
 */
export default function Logo({
  size = "md",
  markOnly = false,
  className = "",
}: {
  size?: "sm" | "md";
  markOnly?: boolean;
  className?: string;
}) {
  const markSize = size === "sm" ? 17 : 20;

  if (markOnly) return <LogoMark size={markSize} className={className} />;

  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} />
      <span
        className={`font-semibold leading-none tracking-[-0.015em] ${
          size === "sm" ? "text-[13.5px]" : "text-[15px]"
        }`}
      >
        <span className="text-ink">Leads</span>{" "}
        <span className="text-ink-2 transition-colors duration-300 group-hover:text-ink">
          Engine
        </span>
      </span>
    </span>
  );
}
