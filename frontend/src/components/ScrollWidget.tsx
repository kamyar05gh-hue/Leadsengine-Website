import { SITE } from "@/constants/site";
import { useLang } from "@/i18n/LanguageContext";
import { LogoMark } from "@/components/Logo";


/**
 * A small, permanent way back to the one thing this page asks for.
 *
 * Back to the styling the client preferred: a dark pill with a GOLD edge and
 * a soft gold glow, the LE mark on the left, one label in white. The progress ring that
 * briefly lived in the mark's place is gone — it read as a loading spinner
 * rather than as a control.
 *
 * ALWAYS ON, BY INSTRUCTION. It used to appear only between "Der blinde
 * Fleck" and "Der nächste Schritt" — a window that kept it off the hero and
 * off the closing CTA it pointed at. The client asked for it to be present
 * for the whole scroll instead, so the window is gone along with the scroll
 * listener that maintained it: this component now renders one static element
 * and does no work at all while the page scrolls, which is strictly cheaper
 * than what it replaced.
 *
 * It is `fixed`, so it never overlaps content in the layout sense — it sits
 * above it. The hero's own CTA is on the left of the copy column and this is
 * bottom-right, so on a phone the two do not collide.
 */
export default function ScrollWidget() {
  const { t } = useLang();

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-40 print:hidden sm:bottom-7 sm:right-6">
      {/* THE SAME DESTINATION AS EVERY OTHER CTA. This used to scroll to the
          `#analyse` section at the foot of the page; it now opens the funnel
          directly, like the buttons do. */}
      {/* SOLID GROUND, NOT `backdrop-blur-md`. A backdrop-filter forces the
          browser to re-sample and re-blur whatever is behind the element on
          every frame it moves over — and now that this pill is on screen for
          the entire scroll rather than for one section, that is a per-frame
          cost for the whole page, on the platform where backdrop-filter is
          most expensive. Over this near-black ground the blur was never
          visible anyway: `bg-bg` is the same colour the /90 was resolving to. */}
      <a
        href={SITE.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pm-cta group pointer-events-auto flex items-center gap-3 rounded-full border bg-bg py-3 pl-4 pr-5 transition-[border-color,box-shadow] duration-500"
        style={{
          borderColor: "rgb(var(--le-gold-bright-rgb) / 0.7)",
          boxShadow:
            "0 0 30px -4px rgb(var(--le-gold-rgb) / 0.6), 0 10px 30px -14px rgba(0,0,0,0.9)",
        }}
      >
        <LogoMark size={19} className="h-auto w-[26px] shrink-0" />
        <span className="text-[14px] font-medium leading-none tracking-[-0.01em] text-white">
          {t.cta.short}
        </span>
      </a>
    </div>
  );
}
