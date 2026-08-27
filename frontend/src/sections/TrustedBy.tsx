/**
 * WHY THIS FILE HAS A PHONE BRANCH AT ALL — the measurement, so nobody
 * "simplifies" it back.
 *
 * The loop is one very wide track translated by -50%. MEASURED at a 390px
 * viewport, that track is 12,788 CSS px wide for the logo band and 2,742 for
 * the platform strip. An iPhone renders at devicePixelRatio 3, so the layer
 * the compositor is asked to allocate is 38,364 and 8,226 DEVICE pixels wide.
 *
 * iOS Safari's maximum texture dimension is between 4,096 and 16,384px
 * depending on the chip. 38,364 is beyond every one of them. When a layer
 * cannot be allocated, Safari does not fail loudly — it drops the layer out
 * of hardware compositing and repaints a 12,788px-wide element on the CPU on
 * every animation frame, forever. That is why the site was "very slow and
 * almost without animations" on iOS specifically and merely heavy elsewhere:
 * Chromium tiles large layers, WebKit gives up.
 *
 * Below `md` the marquee is therefore not a marquee. One copy of the row,
 * wrapped, centred, static: no oversized layer, no animation, nothing for the
 * compositor to refuse. Every logo is still visible — arguably more of them
 * than a phone-width loop ever showed at once. Desktop keeps the loop, where
 * the track is well inside the limits at devicePixelRatio 1-2.
 */
import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SITE } from "@/constants/site";
import ScrollMarquee from "@/components/ScrollMarquee";

/** Soft edges, so logos enter and leave the band instead of popping. */
const EDGE_MASK = "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)";

/**
 * ANY file dropped into `src/assets/logos/` is picked up automatically — no
 * filename convention, no list to edit, no code change. Vite resolves the
 * glob at build time and hashes each file, so they are cached properly too.
 *
 * The display name is derived from the filename: `bildung-bern.svg` becomes
 * "Bildung Bern". That name is only used for the accessible label and for the
 * text fallback, so a rough transformation is fine.
 */
const FILES = import.meta.glob("@/assets/logos/*.{svg,png,webp,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const DROPPED = Object.entries(FILES)
  .map(([path, url]) => {
    const file = path.split("/").pop() ?? "";
    const slug = file.replace(/\.[^.]+$/, "");
    /* A purely numeric slug means the wordmark could not be read off the
       supplied sheet, so there is no brand name to announce. The logo still
       shows; only the accessible label falls back to a generic one. Rename
       the file and the real name appears. */
    const named = !/^\d+$/.test(slug);
    const name = named
      ? slug
          .replace(/[-_]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "";
    return { slug, name, url };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

/**
 * The trust band — directly under the hero.
 *
 * THE REAL LOGOS, IN THEIR OWN COLOURS. An earlier version tinted them all to
 * one brand blue by using each file as a mask; the client asked for the
 * genuine marks instead, so they are painted as images. What holds the row
 * together is not colour but SIZING — see `box` below — plus a slight dim at
 * rest that lifts on hover.
 *
 * A supplied file still needs a TRANSPARENT background: the artwork here is
 * light-on-dark and the black was keyed out when the files were prepared, but
 * a logo saved on a solid white rectangle would show as a white block on this
 * dark ground.
 *
 * NO FILES YET? The band falls back to the brand NAMES as wordmarks in the
 * same blue, so it reads as a deliberate row rather than a row of gaps. The
 * moment files land in `src/assets/logos/` they take over.
 *
 * THE LOOP is CSS only. The track holds the set four times and travels
 * exactly -50%, landing on a frame identical to the start — no seam, no
 * reset, no JavaScript measuring anything. Four copies rather than two so the
 * track outruns an ultrawide viewport. It pauses off screen, and under
 * reduced motion it does not move at all.
 */
export default function TrustedBy() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  /* ROOT MARGIN IS EXPLICIT HERE, AND MUST STAY THAT WAY.
     `useInView` defaults to `rootMargin: "0px 0px -8% 0px"`, which is right
     for reveals — it holds a reveal back until the element is properly on
     screen. For a pause-when-off-screen animation it is a bug: the shrunken
     bottom edge means the band is reported OUT of view while its last ~70px
     are still visible, so the logos visibly froze mid-scroll. It showed up
     on scrolling UP, because that is when the band crosses that edge.

     A positive margin instead: the loop resumes 300px BEFORE the band comes
     into view and pauses 300px after it leaves. The off-screen pause the
     comment below relies on is kept, and the marquee is now guaranteed to be
     moving at every moment it can actually be seen — which also hides the
     observer -> state -> re-render latency on resume. */
  const { ref, inView } = useInView<HTMLDivElement>({
    threshold: 0,
    once: false,
    rootMargin: "300px 0px 300px 0px",
  });

  const items = DROPPED.length
    ? DROPPED
    : SITE.references.map((r) => ({ ...r, url: "" }));

  /* EVERY LOGO TO THE SAME OPTICAL WEIGHT.
     A fixed box with `contain` sizes by whichever edge runs out first, so a
     wide wordmark like Nau.ch fills its width while a portrait mark like
     Kramer is height-limited and renders about a quarter of the size. A logo
     wall has to normalise on HEIGHT and let width follow the aspect, which
     needs each file's real dimensions — so they are measured once on mount.
     Square and portrait marks get a small boost, because at equal height they
     carry visibly less ink than a long wordmark. */
  const [aspect, setAspect] = useState<Record<string, number>>({});
  useEffect(() => {
    let cancelled = false;
    DROPPED.forEach(({ slug, url }) => {
      const img = new Image();
      img.onload = () => {
        if (!cancelled && img.naturalHeight) {
          setAspect((m) => ({ ...m, [slug]: img.naturalWidth / img.naturalHeight }));
        }
      };
      img.src = url;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* BASE is the normalised logo HEIGHT in px, and the client asked for the
     wall to run larger. Raised 30 -> 42, with the width cap lifted in step
     (168 -> 232) — the cap exists so an extremely wide wordmark cannot eat
     the row, and leaving it at 168 while the height grew would have clipped
     exactly those marks back down and undone the change for them. The
     portrait/square boost stays at 1.25x for the same reason as before. */
  const BASE = 42;
  const box = (slug: string) => {
    const ar = aspect[slug];
    if (!ar) return { height: BASE, width: 168 };
    const h = Math.round(BASE * (ar < 1.4 ? 1.25 : 1));
    return { height: h, width: Math.min(232, Math.round(h * ar)) };
  };

  /* The band must be moving at first glance, before any observer has
     reported. It runs unconditionally until seen once, then follows
     visibility and pauses off screen. */
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  const running = !reduced && (inView || !seen);

  const row = (hidden: boolean, key: number) => (
    <ul
      key={key}
      aria-hidden={hidden ? "true" : undefined}
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14 lg:gap-16 lg:pr-16"
    >
      {items.map(({ name, slug, url }) => (
        <li key={slug} className="flex shrink-0 items-center">
          {url ? (
            /* THEIR OWN COLOURS. These were tinted to one brand blue via a
               mask; the client asked for the real logos instead, so they are
               painted as images. The supplied artwork is light-on-dark with
               the background keyed out, which already sits correctly on this
               ground — Jobdoor stays blue, payyap teal, the SBB mark inside
               Transsicura red. Slightly dimmed at rest and brought to full on
               hover, so a wall of different weights still reads as one row. */
            <img
              src={url}
              alt={name || t.trusted.clientLogo}
              title={name || undefined}
              loading="lazy"
              decoding="async"
              className="block shrink-0 object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
              style={{
                height: `${box(slug).height}px`,
                width: `${box(slug).width}px`,
              }}
            />
          ) : (
            <span className="whitespace-nowrap text-[19px] font-semibold tracking-[-0.01em] text-hi opacity-75 transition-opacity duration-300 hover:opacity-100 sm:text-[22px]">
              {name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    /* No bottom rule, and now no tick band underneath either: this section
       IS the trust block, start to finish. It needs real bottom padding of
       its own for the first time — it used to borrow the tick band's. */
    <section aria-label={t.trusted.label} className="relative bg-bg pb-12 pt-9 sm:pb-14 sm:pt-11">
      {/* Just the label. The byline used to sit here as a subtitle; it is
          now BELOW the logo row — see the note at the foot of this file. */}
      <div className="le-container mb-7 text-center sm:mb-8">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink-3">
          {t.trusted.label}
        </p>
      </div>

      {/* PHONE: the loop is back, but SCROLLED rather than transformed — a
          transform of this track asks iOS for a texture it cannot allocate,
          which is the whole story in the note at the top of this file. A
          scroller only paints what is on screen, so the cost is flat however
          many logos are in the row. See ScrollMarquee.tsx. */}
      <ScrollMarquee
        className="md:hidden"
        speed={48}
        ariaLabel={t.trusted.label}
      >
        <ul className="flex shrink-0 items-center gap-10 pr-10">
          {items.map(({ name, slug, url }) => (
            <li key={slug} className="flex shrink-0 items-center">
              {url ? (
                <img
                  src={url}
                  alt={name || t.trusted.clientLogo}
                  title={name || undefined}
                  loading="lazy"
                  decoding="async"
                  className="block shrink-0 object-contain opacity-80"
                  style={{
                    height: `${Math.round(box(slug).height * 0.85)}px`,
                    width: `${Math.round(box(slug).width * 0.85)}px`,
                  }}
                />
              ) : (
                <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.01em] text-hi opacity-75">
                  {name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </ScrollMarquee>

      {/* md AND UP: the loop, unchanged. */}
      <div
        ref={ref}
        className="relative hidden w-full overflow-hidden md:block"
        style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
      >
        <div
          className="flex w-max items-center"
          style={
            reduced
              ? undefined
              : {
                  animationName: "le-marquee",
                  /* Slower than the platform strip: these are logos, not
                     words, and they need longer in front of the eye to be
                     recognised. */
                  animationDuration: "104s",
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                  animationPlayState: running ? "running" : "paused",
                }
          }
        >
          {/* TWO COPIES, NOT FOUR. The track travels exactly -50%, so it only
              has to be twice the viewport for the loop to be seamless. One
              copy of nineteen logos is already ~3,200px, so two is ample even
              on an ultrawide screen — and four was needlessly doubling the
              size of the composited layer. */}
          {[0, 1].map((i) => row(i !== 0, i))}
        </div>
      </div>

      {/* THE BYLINE, UNDER THE LOGOS — its fourth and final position, and
          the one the client asked for. It closes the band on its own now:
          the three-tick section that used to follow has been removed, so
          this is the last line of the whole trust block. */}
      <div className="le-container mt-7 text-center sm:mt-8">
        <p className="text-[12.5px] leading-snug text-ink-3">{t.trusted.byline}</p>
      </div>
    </section>
  );
}
