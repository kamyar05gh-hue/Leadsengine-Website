import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { SITE } from "@/constants/site";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import PrimaryCta from "@/components/PrimaryCta";
import TeamCards from "@/components/TeamCards";
import { toLines } from "@/lib/toLines";

/**
 * "Über uns" — AN ARTICLE, NOT A LANDING PAGE.
 *
 * THE LAYOUT RULE, WHICH TWO EARLIER VERSIONS GOT WRONG.
 * The page is a CENTRED COLUMN OF LEFT-ALIGNED TEXT. "Centred" describes the
 * column's position on the page, not the alignment of the words inside it:
 * one readable measure sitting in the middle of the viewport, with the
 * headline at its left edge and the paragraphs starting directly beneath —
 * the way any written page is set. A previous version centre-ALIGNED every
 * line, which is unreadable for prose and was not what was asked for. An
 * earlier one put a sticky fact card beside the column, which made the page a
 * near-copy of the competitor page it was modelled on.
 *
 * AND IT IS DELIBERATELY QUIETER THAN THE HOME PAGE. Same tokens, same type
 * scale, same reveal system, same `le-*` classes — but no card grid, no
 * panels, no numbered pills, no split layouts. A background page is read top
 * to bottom by someone who already wants the information; the home page has
 * to win a skimming stranger. Visual interest here comes from the aurora, the
 * hairline rules and the staggered reveals, not from more boxes.
 *
 * Language is client-side (`?lang=en`), as everywhere on this site.
 *
 * THE PAGE IS NOW THE TEAM, BY INSTRUCTION. The client asked for it to follow
 * the structure of future-media.ch/team: portrait cards, name, role — and
 * explicitly "without explanations", so no bios and no article beneath them.
 * The long-form sections that used to fill this page (who we are, why Leads
 * Engine exists, how we work, what we do not promise) are no longer rendered.
 *
 * THEIR COPY IS DELIBERATELY LEFT IN THE DICTIONARY. `about.page.sections`,
 * `about.page.commitments` and `about.pillars` are all still there, unused
 * and still translated in both languages, so restoring any of it is one JSX
 * block rather than a rewrite. Deleting the entries would have thrown away
 * work the client had already reviewed line by line.
 *
 * What remains besides the roster is the part a background page must carry
 * regardless: who the legal entity is, where it sits, and one way to get in
 * touch.
 */

/* The masthead's measure. The article this page used to carry is gone (see
   the note above), so this now sets only the title block — the card grid
   below runs wider, because a three-column grid needs the room and there is
   no prose left whose line length it could hurt.

   `Heading`, `Paragraph` and `LabelledLine` were removed with the article;
   they rendered nothing once the blocks list went, and TypeScript flagged
   them. The dictionary entries they read are still there. */
const COLUMN = "mx-auto w-full max-w-[46rem]";

export default function About() {
  const { t } = useLang();
  const page = t.about.page;

  /* Hero.tsx golds the LAST line of its headline. Only do that when the
     headline actually breaks into more than one line — golding the single
     line of a one-sentence title would colour the whole thing. */
  const titleLines = toLines(page.heroTitle);
  const goldLine = titleLines.length > 1 ? titleLines.length - 1 : undefined;

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header onSubpage current="/ueber-uns/" />
      {/* NO ScrollWidget HERE: its CTA points at `#analyse` and it decides
          when to appear by watching `#problem` and `#analyse` scroll past.
          Neither id exists on this page. */}

      <main>
        {/* ---------------------------------------------------------------
            MASTHEAD — the article's title block. Left-aligned inside the
            same centred column the body uses, so the headline and the first
            paragraph share one left edge all the way down the page.
            --------------------------------------------------------------- */}
        <section className="le-noise relative overflow-clip bg-bg pb-12 pt-28 lg:pb-16 lg:pt-32">
          <div className="le-aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="le-container relative">
            <div className={COLUMN}>
              <Reveal dir="down">
                <p className="le-kicker flex items-center gap-2.5">
                  <span aria-hidden="true" className="block h-px w-6 bg-accent-bright" />
                  {page.heroKicker}
                </p>
              </Reveal>

              <h1 className="mt-6 text-[clamp(2.05rem,4.2vw,2.85rem)] font-semibold leading-[1.13] tracking-[-0.03em] text-ink">
                <RevealText
                  lines={titleLines}
                  highlight={goldLine}
                  highlightClassName="text-gold-vivid"
                  stagger={120}
                />
              </h1>

              <Reveal delay={340}>
                <p className="mt-6 text-[clamp(1rem,1.7vw,1.15rem)] font-medium leading-[1.55] text-ink-2">
                  {page.heroLead}
                </p>
              </Reveal>

              {/* NO FIGURES ROW HERE, BY INSTRUCTION. A "2 Locations / 6 Team
                  / 5 AI systems checked" strip was removed at the client's
                  request: on a background page it reads as a marketing stat
                  bar, and the same facts are already stated in the prose and
                  in the address block at the foot of the article. */}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            THE TEAM — the page's content, in the reference structure.
            --------------------------------------------------------------- */}
        <section className="le-noise relative overflow-clip bg-bg-alt pb-[clamp(4rem,7vw,6rem)] pt-[clamp(3rem,5vw,4.5rem)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[-10%] top-[8%] h-[420px] w-[620px] max-w-[140vw] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgb(var(--le-accent-rgb) / 0.16), transparent 70%)",
            }}
          />

          <div className="le-container relative">
            {/* Wider than the article measure this page used to run at: a
                three-column card grid needs the room, and there is no prose
                here that a long line length could hurt. */}
            <div className="mx-auto w-full max-w-5xl">
              <Reveal dir="up">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
                  <p className="le-kicker">{t.about.teamKicker}</p>
                </div>
                <h2 className="mt-5 text-[clamp(1.6rem,2.6vw,2.15rem)] font-semibold leading-[1.16] tracking-[-0.025em] text-ink">
                  {t.about.teamTitle}
                </h2>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-ink-2">
                  {t.about.teamLead}
                </p>
              </Reveal>

              <div className="mt-12 lg:mt-14">
                <TeamCards />
              </div>

              {/* Where we are, and who runs it — plain lines, no card. */}
              <Reveal dir="up" className="mt-16 lg:mt-20">
                <div className="border-t border-line pt-8">
                  <p className="text-[13px] font-semibold tracking-[-0.005em] text-ink">
                    {SITE.company}
                  </p>
                  <address className="mt-3 space-y-1.5 not-italic">
                    {SITE.locations.map((loc) => (
                      <span key={loc.city} className="block text-[13px] leading-[1.6] text-ink-3">
                        {loc.address}
                      </span>
                    ))}
                  </address>
                  <p className="mt-4">
                    <a
                      href={SITE.webHref}
                      target="_blank"
                      rel="noreferrer"
                      className="le-link inline-flex items-center gap-1.5 text-[13px]"
                    >
                      {page.factsSiteLabel}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </p>
                </div>
              </Reveal>

              {/* The ask. One line and a button — it closes the article, it
                  does not restage the home page's closing section. */}
              <Reveal dir="up" className="mt-12 lg:mt-14">
                <div className="border-t border-line pt-8">
                  <p className="text-[15px] leading-[1.75] text-ink-2">{page.closing.body}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
                    <PrimaryCta size="md" label={page.closing.button} />
                    <a href="/" className="le-link text-[13.5px]">
                      ← {page.backLabel}
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer onSubpage />
    </>
  );
}
