import { useEffect, useState } from "react";
import { SITE } from "@/constants/site";
import { useLang } from "@/i18n/LanguageContext";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { LogoMark } from "@/components/Logo";

/** Where the widget appears, and where it stands down again. */
const FROM = "problem";
const TO = "analyse";

/**
 * A small, permanent way back to the one thing this page asks for.
 *
 * Back to the styling the client preferred: a dark pill with a GOLD edge and
 * a soft gold glow, the LE mark on the left, one label in white. The progress ring that
 * briefly lived in the mark's place is gone — it read as a loading spinner
 * rather than as a control.
 *
 * VISIBILITY is the window the client asked for: it fades in once "Was sich
 * verändert hat" has been reached and fades out again as "Der nächste Schritt"
 * arrives, so it never overlaps the hero and never sits on top of the closing
 * call to action it points at.
 *
 * One rAF-throttled passive scroll listener, and it sets a single boolean.
 */
export default function ScrollWidget() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      raf = 0;
      const from = document.getElementById(FROM);
      const to = document.getElementById(TO);
      const vh = window.innerHeight || 1;
      const started = from ? from.getBoundingClientRect().top < vh * 0.5 : false;
      const ended = to ? to.getBoundingClientRect().top < vh * 0.75 : false;
      setShown(started && !ended);
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-4 z-40 print:hidden sm:bottom-7 sm:right-6"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(12px)",
        transition: reduced
          ? undefined
          : "opacity 380ms var(--le-ease-out), transform 380ms var(--le-ease-out)",
        visibility: shown ? "visible" : "hidden",
      }}
    >
      {/* THE SAME DESTINATION AS EVERY OTHER CTA. This used to scroll to the
          `#analyse` section at the foot of the page; it now opens the funnel
          directly, like the buttons do. `TO` is still the id this widget
          WATCHES to decide when to stand down — the two were the same value
          by coincidence, not by design, and only the link has changed. */}
      <a
        href={SITE.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={shown ? undefined : -1}
        aria-hidden={shown ? undefined : "true"}
        className="pm-cta group pointer-events-auto flex items-center gap-3 rounded-full border bg-bg/90 py-3 pl-4 pr-5 backdrop-blur-md transition-[border-color,box-shadow] duration-500"
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
