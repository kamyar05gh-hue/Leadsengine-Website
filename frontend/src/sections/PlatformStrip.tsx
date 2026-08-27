import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { PlatformMark } from "@/components/ChatMockup";

/** Soft edges, so names enter and leave the strip instead of popping. */
const EDGE_MASK = "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)";

/**
 * The platform strip — full-bleed, directly under the hero.
 *
 * The six-item feature grid that used to sit here was removed at the client's
 * request; what is left is the part they wanted kept, given the whole width of
 * the page: one continuously looping row of the platforms that get checked.
 *
 * THE LOOP is CSS only and genuinely never ends. The track holds the platform
 * set FOUR times and travels exactly -50%, which lands on a frame identical to
 * the start — no seam, no reset, and no JavaScript measuring anything. Four
 * copies rather than two so the track is always wider than an ultrawide
 * viewport; with two, a 2560px screen would run out of track mid-loop and show
 * a gap.
 *
 * It pauses when the strip is off screen, and under reduced motion it does not
 * animate at all — the row simply sits still and stays completely readable.
 *
 * Only the first copy is announced; the rest are `aria-hidden`, so a screen
 * reader hears the five platforms once.
 */
export default function PlatformStrip() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  /* Explicit root margin — same reasoning as `TrustedBy`, which had the same
     bug: the hook's default `-8%` bottom margin reports the strip as out of
     view while it is still visible, freezing the loop on screen. */
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0,
    once: false,
    rootMargin: "300px 0px 300px 0px",
  });
  const platforms = t.hero.platforms;

  /* The loop must be turning at first glance, before any observer has had a
     chance to report. So it runs unconditionally until the strip has been seen
     once; after that it follows visibility and pauses off screen as usual. */
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  const running = !reduced && (inView || !seen);

  const row = (hidden: boolean, key: number) => (
    <ul
      key={key}
      aria-hidden={hidden ? "true" : undefined}
      className="flex shrink-0 items-center gap-14 pr-14 sm:gap-[72px] sm:pr-[72px] lg:gap-24 lg:pr-24"
    >
      {platforms.map((name) => (
        <li key={name} className="flex shrink-0 items-center gap-3">
          {/* Deliberately larger than the label beside them, by instruction —
              the marks are the content of this strip and the words are the
              caption, not the other way round. */}
          <PlatformMark
            name={name}
            className="h-[30px] w-[30px] shrink-0 text-hi sm:h-[34px] sm:w-[34px]"
          />
          <span className="whitespace-nowrap text-[15px] font-medium tracking-[-0.01em] text-ink-2 sm:text-[17px]">
            {name}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label={t.features.marqueeLabel}
      className="relative border-y border-line bg-bg-alt pb-9 pt-6 lg:pb-11 lg:pt-7"
    >
      <div ref={ref}>
        <p className="le-kicker le-container mb-7 text-center">{t.features.marqueeLabel}</p>

        {/* Full-bleed: deliberately outside `le-container`. */}
        <div
          className="relative overflow-hidden"
          style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
        >
          <div
            className="flex w-max"
            style={
              reduced
                ? undefined
                : {
                    animationName: "le-marquee",
                    animationDuration: "42s",
                    animationTimingFunction: "linear",
                    animationIterationCount: "infinite",
                    animationPlayState: running ? "running" : "paused",
                  }
            }
          >
            {[0, 1, 2, 3].map((i) => row(i > 0, i))}
          </div>
        </div>
      </div>
    </section>
  );
}
