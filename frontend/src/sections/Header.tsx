import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useScrolled } from "@/hooks/useScrolled";
import { SITE } from "@/constants/site";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/* Only ids that actually exist on the page. The step timeline, the metrics
   section and the about section were all removed, so `prozess`, `ergebnisse`
   and `ueber-uns` are gone with them — `t.nav.results` now points at the
   proof-in-numbers block, which is what "Ergebnisse" means to a visitor.

   The nav had drifted out of sync with the page: `zielgruppe` was observed
   for the active-link highlight but had no link, and the testimonials had
   neither. Both are now linked, so the bar reflects what the page actually
   contains and every observed section is reachable from it. */
/* Only ids that still exist on the page. `zielgruppe` and `vorteile` were
   removed along with their sections; observing a missing id costs nothing but
   quietly hides the fact that the nav and the page have drifted apart, which
   is exactly the bug the note above records. */
const SECTION_IDS = ["so-funktionierts", "markt-daten", "stimmen", "faq"] as const;
type SectionId = (typeof SECTION_IDS)[number];

/** The one About URL. Language is a query param on this site, never a path. */
const ABOUT_HREF = "/ueber-uns/";


/**
 * A slim solid bar — not a floating capsule.
 *
 * 56px tall, transparent over the hero so the engine runs edge to edge behind
 * it, resolving into a near-opaque blurred rail past 40px. The bottom border
 * is always in the DOM (transparent at rest) so the resolve costs no layout.
 *
 * Link treatment is a deliberate client constraint. The ONLY thing marking
 * the active item is a blue underline directly beneath its label text — never
 * under an icon or ordinal, never spanning the row. No pill, no fill, no box,
 * in any state. Default label is muted grey; hover turns it white and changes
 * nothing else.
 *
 * The underline is a border that is always present and merely transparent
 * when inactive, so becoming active is a pure colour transition and the row
 * can never shift. `outline-none` suppresses the click ring; keyboard users
 * still get the global `:focus-visible` outline, which a mouse click does not
 * trigger.
 */
/**
 * `onSubpage` — the SAME header, mounted on a page that is not the home page.
 *
 * Two things have to change there and nothing else: every section link has to
 * carry the home path in front of its hash (`/#faq`, not `#faq`), because the
 * sections live on the home page; and the scroll-spy has to stay switched off,
 * because none of those sections exist here to observe. The markup, the
 * classes, the logo, the transition and the language switcher are untouched,
 * so a subpage gets the real header rather than a lookalike.
 */
export default function Header({
  onSubpage = false,
  current,
}: { onSubpage?: boolean; current?: string } = {}) {
  const { t } = useLang();
  const scrolled = useScrolled(40);
  const [active, setActive] = useState<SectionId | "">("");
  const base = onSubpage ? "/" : "";

  /* Six in-page sections plus "Über uns", which is a real page rather than an
     anchor. It carries an explicit `href` instead of a section id: it has no
     section to scroll-spy, and it must resolve to `/ueber-uns/` from every
     page, including from `/ueber-uns/` itself. Added at the client's request
     — and added HERE, to the one shared Header, so the home page and the
     subpages cannot end up with different navs. */
  const links: { id?: SectionId; href?: string; label: string }[] = [
    { id: "so-funktionierts", label: t.nav.how },
    { id: "markt-daten", label: t.nav.results },
    /* "Stimmen" removed at the client's request. The section itself stays on
       the page and keeps its id, so the anchor still resolves for anything
       that links to it — it simply is not advertised in the nav any more.
       "Für wen" and "Vorteile" are gone for a different reason: the sections
       they pointed at were deleted. */
    { id: "faq", label: t.nav.faq },
    { href: ABOUT_HREF, label: t.nav.about },
  ];

  /* Active-section highlight. Everything below the hero is lazy-mounted, so
     the sections do not exist on first paint — retry on a bounded schedule
     and stop as soon as all of them have been found. */
  useEffect(() => {
    if (onSubpage) return;
    let io: IntersectionObserver | null = null;
    let timer = 0;
    let tries = 0;

    const attach = () => {
      const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
        (el): el is HTMLElement => el !== null,
      );

      if (els.length < SECTION_IDS.length && tries < 12) {
        tries += 1;
        timer = window.setTimeout(attach, 400);
      }
      if (els.length === 0) return;

      io?.disconnect();
      /* Which sections currently straddle the middle band. Taking the FIRST in
         document order — rather than whichever entry happened to fire last —
         is what stops the last lazy section from flashing "active" while the
         page is still at the top. */
      const live = new Set<SectionId>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = entry.target.id as SectionId;
            if (entry.isIntersecting) live.add(id);
            else live.delete(id);
          }
          setActive(SECTION_IDS.find((id) => live.has(id)) ?? "");
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
      );
      els.forEach((el) => observer.observe(el));
      io = observer;
    };

    attach();
    return () => {
      io?.disconnect();
      window.clearTimeout(timer);
    };
  }, [onSubpage]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500 ease-out print:hidden ${
        /* OPAQUE, NOT BLURRED. This bar is fixed and therefore on screen
           for the entire scroll, so a `backdrop-filter` here is not a
           one-off — it makes the browser re-sample and re-blur the strip of
           page behind it on every frame the user scrolls, for the whole
           document. At 95% opacity over a near-black ground the blur was
           contributing about five percent of the pixels; going fully opaque
           looks the same and costs nothing. */
        scrolled
          ? "border-line bg-bg"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="le-container flex h-14 items-center gap-6 lg:gap-8">
        <a href={onSubpage ? "/" : "#top"} aria-label={SITE.brand} className="shrink-0 rounded-md">
          <Logo />
        </a>

        {/* Centre-left: the nav sits next to the logo, not floated to the
            middle — a product bar, not a marketing capsule. */}
        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center gap-6 lg:flex xl:gap-7">
          {links.map((l) => {
            /* A page link is active when it IS the current page; a section
               link is active when the scroll-spy says so. */
            const href = l.href ?? `${base}#${l.id}`;
            const isActive = l.href ? l.href === current : active === l.id;
            return (
              <a
                key={l.href ?? l.id}
                href={href}
                aria-current={isActive ? "true" : undefined}
                className={`whitespace-nowrap border-b-2 pb-1 text-[13px] font-medium tracking-[-0.005em] outline-none transition-[color,border-color] duration-200 ease-out ${
                  isActive
                    ? "border-accent-bright text-ink"
                    : "border-transparent text-ink-2 hover:text-ink"
                }`}
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        {/* The header CTA was removed at the client's request. The page still
            offers the action in the hero, in the closing section and in the
            floating widget, so nothing became unreachable. */}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
