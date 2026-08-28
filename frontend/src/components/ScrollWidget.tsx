import { SITE } from "@/constants/site";
import { useLang } from "@/i18n/LanguageContext";
import { LogoMark } from "@/components/Logo";

/**
 * A permanent way to the one thing this page asks for, bottom-right, for the
 * whole scroll.
 *
 * REVERTED, BY INSTRUCTION. This briefly rendered the shared `PrimaryCta` so
 * that every call to action on the site was literally the same element. The
 * client preferred the original treatment here and asked for it back: the LE
 * mark on the left, a GOLD edge and a GOLD glow — deliberately different from
 * the blue pills in the page, because this one is not part of the reading
 * flow. It floats above it, and the different light is what says so.
 *
 * The `pm-cta` marker stays: it is the analytics contract for the secondary
 * goal in the dashboard and must not move.
 *
 * Hover intensifies the gold and nothing else — no lift, no scale. The
 * element is fixed over live content, so anything that moved it would drag
 * the eye away from whatever the visitor was actually reading.
 *
 * No scroll listener and no state: one fixed element that does no work while
 * the page moves.
 */
export default function ScrollWidget() {
  const { t } = useLang();

  return (
    /* `pointer-events-none` on the positioner and `auto` on the link, so the
       empty space around the pill never swallows a tap on the page behind
       it — on a phone this corner overlaps real content. */
    <div className="pointer-events-none fixed bottom-5 right-4 z-40 print:hidden sm:bottom-7 sm:right-6">
      {/* Same rule as PrimaryCta: only an off-site destination opens a tab. */}
      <a
        href={SITE.ctaUrl}
        target={/^https?:\/\//i.test(SITE.ctaUrl) ? "_blank" : undefined}
        rel={/^https?:\/\//i.test(SITE.ctaUrl) ? "noopener noreferrer" : undefined}
        className="le-gold-pill pm-cta group pointer-events-auto flex items-center gap-3 rounded-full border bg-bg py-3 pl-4 pr-5"
      >
        <LogoMark size={19} className="h-auto w-[26px] shrink-0" />
        <span className="text-[14px] font-medium leading-none tracking-[-0.01em] text-white">
          {t.cta.short}
        </span>
      </a>
    </div>
  );
}
