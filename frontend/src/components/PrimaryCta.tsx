import { ArrowRight } from "lucide-react";
import { SITE } from "@/constants/site";
import { useLang } from "@/i18n/LanguageContext";

/**
 * The single conversion action on the page.
 *
 * Analytics markers, do not touch:
 *   `pm-cta pm-cta-btn` — the primary goal in the dashboard (solid variant).
 *   `pm-cta` alone      — the secondary goal (outline variant, header only).
 * `le-magnetic` tells CursorGlow to brighten its ring over the button.
 *
 * ONE APPEARANCE FOR EVERY CTA, INCLUDING THE FIXED ONE.
 * The client chose the floating widget's treatment as the house style: a dark
 * pill on a lit blue edge. `.le-cta-pill` in index.css carries the whole
 * thing — see the note there for the hover/press behaviour, which replaces
 * the earlier "nothing may move" contract at the client's request.
 *
 * `variant` is kept because callers still pass it and the two variants still
 * differ in weight, but both are now the same pill: `outline` simply sits at
 * a lower glow, for the places where a second CTA appears beside a first and
 * two identical pills would compete.
 *
 * Sizes are deliberately small. A restrained button is what separates a
 * premium product surface from a landing-page template.
 */
export type CtaSize = "sm" | "md" | "lg";
export type CtaVariant = "solid" | "outline";

const SIZING: Record<CtaSize, string> = {
  sm: "px-3.5 py-1.5 text-[13px]",
  md: "px-5 py-2.5 text-[14px]",
  lg: "px-6 py-3 text-[15px]",
};

const ICON: Record<CtaSize, number> = { sm: 13, md: 14, lg: 15 };

export default function PrimaryCta({
  size = "md",
  variant = "solid",
  label,
  className = "",
}: {
  size?: CtaSize;
  variant?: CtaVariant;
  label?: string;
  className?: string;
}) {
  const { t } = useLang();

  /* THE MARKER CLASSES ARE THE ANALYTICS CONTRACT and must not move:
     `pm-cta pm-cta-btn` is the primary goal in the dashboard, `pm-cta` alone
     the secondary. Only the appearance changed. */
  const skin =
    variant === "outline"
      ? "pm-cta le-cta-pill le-cta-pill--quiet"
      : "pm-cta pm-cta-btn le-cta-pill";

  return (
    <a
      href={SITE.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${skin} le-magnetic group rounded-full font-semibold tracking-[-0.005em] ${SIZING[size]} ${className}`}
    >
      <span>{label ?? t.cta.primary}</span>
      <ArrowRight
        size={ICON[size]}
        strokeWidth={2.2}
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
      />
    </a>
  );
}
