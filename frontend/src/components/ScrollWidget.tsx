import { useLang } from "@/i18n/LanguageContext";
import PrimaryCta from "@/components/PrimaryCta";

/**
 * A permanent way to the one thing this page asks for, bottom-right, for the
 * whole scroll.
 *
 * IT IS LITERALLY THE SAME BUTTON AS EVERY OTHER CTA NOW. This used to be a
 * bespoke pill with a gold edge, a gold glow and the LE mark inside it; the
 * client liked that shape enough to make it the house style, so the shape
 * moved into `PrimaryCta` / `.le-cta-pill` and this file lost its copy of it.
 * The mark is gone (it was the one thing asked to be dropped) and the glow is
 * blue rather than gold.
 *
 * Rendering the shared component rather than restyling a second element is
 * the point: there is now no way for the floating CTA and the in-page CTAs to
 * drift apart, and the analytics marker classes come along automatically.
 *
 * No scroll listener and no state — one fixed element that does no work while
 * the page moves.
 */
export default function ScrollWidget() {
  const { t } = useLang();

  return (
    /* `pointer-events-none` on the positioner and `auto` on the button, so
       the empty space around the pill never swallows a tap on the page
       behind it — on a phone that corner overlaps real content. */
    <div className="pointer-events-none fixed bottom-5 right-4 z-40 print:hidden sm:bottom-7 sm:right-6">
      {/* NO EXTRA SHADOW UTILITY HERE. Tailwind's `shadow-*` writes the whole
          `box-shadow` property, so adding one silently replaced the pill's
          blue bloom with a plain black drop shadow — the floating CTA lost
          exactly the glow that makes it the house style. The pill brings its
          own shadow; this element only positions it. */}
      <PrimaryCta size="md" label={t.cta.short} className="pointer-events-auto" />
    </div>
  );
}
