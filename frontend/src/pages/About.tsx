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
 * NO TEAM SECTION HERE, BY INSTRUCTION: the roster lives on the home page.
 */

/** The one measure every block on the page is set to. */
const COLUMN = "mx-auto w-full max-w-[46rem]";

/** A section heading in the article. Left-aligned, like everything else. */
function Heading({ children }: { children: string }) {
  return (
    <h2 className="text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold leading-[1.2] tracking-[-0.022em] text-ink">
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: string }) {
  return <p className="mt-4 text-[15px] leading-[1.75] text-ink-2">{children}</p>;
}

/** A "Label: sentence" line — used by the two list-shaped blocks. */
function LabelledLine({ label, text }: { label: string; text: string }) {
  return (
    <p className="mt-4 text-[15px] leading-[1.75] text-ink-2 first:mt-0">
      <strong className="font-semibold text-ink">{label}:</strong> {text}
    </p>
  );
}

export default function About() {
  const { t } = useLang();
  const page = t.about.page;

  /* Hero.tsx golds the LAST line of its headline. Only do that when the
     headline actually breaks into more than one line — golding the single
     line of a one-sentence title would colour the whole thing. */
  const titleLines = toLines(page.heroTitle);
  const goldLine = titleLines.length > 1 ? titleLines.length - 1 : undefined;

  /* The article, in reading order. A flat list so the gap between blocks is
     set in ONE place by position, rather than inside each block — nesting it
     is what silently collapsed every heading's margin in an earlier version
     (each heading was the first child of its own wrapper, so `first:mt-0`
     matched all of them). */
  const blocks: Array<{ key: string; node: React.ReactNode }> = [
    ...page.sections.slice(0, 3).map((s) => ({
      key: s.title,
      node: (
        <>
          <Heading>{s.title}</Heading>
          {s.body.map((p) => (
            <Paragraph key={p}>{p}</Paragraph>
          ))}
        </>
      ),
    })),
    {
      key: page.commitments.title,
      node: (
        <>
          <Heading>{page.commitments.title}</Heading>
          <Paragraph>{page.commitments.lead}</Paragraph>
          <div className="mt-5">
            {page.commitments.items.map((it) => (
              <LabelledLine key={it.label} label={it.label} text={it.text} />
            ))}
          </div>
        </>
      ),
    },
    ...page.sections.slice(3).map((s) => ({
      key: s.title,
      node: (
        <>
          <Heading>{s.title}</Heading>
          {s.body.map((p) => (
            <Paragraph key={p}>{p}</Paragraph>
          ))}
        </>
      ),
    })),
    {
      /* `about.pillars` already existed in both dictionaries, written for
         exactly this, and had never been rendered anywhere. */
      key: page.valuesTitle,
      node: (
        <>
          <Heading>{page.valuesTitle}</Heading>
          <div className="mt-5">
            {t.about.pillars.map((p) => (
              <LabelledLine key={p.title} label={p.title} text={p.body} />
            ))}
          </div>
        </>
      ),
    },
  ];

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
            THE ARTICLE
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
            <div className={COLUMN}>
              {blocks.map((block, i) => (
                <Reveal
                  key={block.key}
                  dir="up"
                  className={i === 0 ? undefined : "mt-12 lg:mt-14"}
                >
                  {block.node}
                </Reveal>
              ))}

              {/* Where we are, and who runs it — plain lines, no card. */}
              <Reveal dir="up" className="mt-12 lg:mt-14">
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
