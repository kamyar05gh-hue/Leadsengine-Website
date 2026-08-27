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
 * Motion contract (explicit client request): on hover the ONLY thing that
 * happens is the darker fill sliding in from the left — that lives in
 * `.le-btn` in index.css. No glow, no shadow, no lift, no specular sweep, no
 * scale; the button never changes position. The arrow nudging 2px is inside
 * the shape and is deliberately kept.
 *
 * The ghost variant carries `hover:translate-y-0` because `.le-btn-ghost`
 * ships a -2px lift that would break the same contract.
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

  /* The outline variant carries its accent AT REST — a blue edge and blue type
     from first paint. Hover only intensifies what is already there; it never
     introduces the colour. `hover:translate-y-0` cancels the -2px lift that
     `.le-btn-ghost` ships, because the button must never move. */
  const skin =
    variant === "outline"
      ? "pm-cta le-btn-ghost border-accent-bright/45 bg-accent-bright/[0.06] text-hi hover:translate-y-0 hover:border-accent-bright hover:text-hi-strong"
      : "pm-cta pm-cta-btn le-btn text-white";

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
