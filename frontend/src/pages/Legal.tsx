import { useLang } from "@/i18n/LanguageContext";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { toLines } from "@/lib/toLines";

/** The three legal documents, keyed by the path each is served from. */
export type LegalDoc = "imprint" | "privacy" | "terms";

/**
 * A block that opens with a short "Label: rest of sentence" gets its label
 * promoted to a real heading. The source text is already written that way
 * ("Was wir erheben: …", "Deine Rechte: …") — it was only ever rendered as
 * undifferentiated body copy, which is most of why these pages read as a wall
 * of text next to the rest of the site. The length bound keeps it from firing
 * on a sentence that merely happens to contain a colon.
 */
function parseBlocks(body: string): Array<{ heading?: string; text: string }> {
  return body.split(/\n{2,}/).map((block) => {
    const text = block.trim();
    const m = /^([^:\n]{3,44}):\s+([\s\S]+)$/.exec(text);
    return m ? { heading: m[1], text: m[2] } : { text };
  });
}

/* Gold numerals — see the note on the same constant in `About.tsx`. */
const NUM_PILL =
  "le-mono w-fit rounded-full border border-gold-vivid/30 bg-gold-vivid/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-bright";

/**
 * Impressum / Datenschutz / AGB — built from the main page's own vocabulary.
 *
 * Same construction as `About.tsx`, including both of its corrections: the
 * headline shares a section with the first block instead of standing alone
 * behind its own full set of section padding, and the warm gold accent is
 * spent on the numerals so the page is not one cold hue.
 *
 * Language is client-side (`?lang=en`), matching the home page.
 */
export default function Legal({ doc }: { doc: LegalDoc }) {
  const { t } = useLang();
  const { title, body } = t.legal[doc];
  const blocks = parseBlocks(body);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header onSubpage />

      <main>
        <section
          aria-labelledby="legal-title"
          className="le-noise relative overflow-hidden bg-bg pb-[clamp(4.5rem,7.5vw,7rem)] pt-28 lg:pt-32"
        >
          <div className="le-aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="le-container relative">
            <div className="max-w-3xl">
              <Reveal dir="down">
                <p className="le-kicker flex items-center gap-2.5">
                  <span aria-hidden="true" className="block h-px w-6 bg-accent-bright" />
                  {t.footer.columns.legal}
                </p>
              </Reveal>

              <h1
                id="legal-title"
                className="mt-5 text-[clamp(2.05rem,4.2vw,3.05rem)] font-semibold leading-[1.13] tracking-[-0.03em] text-ink lg:mt-6"
              >
                <RevealText lines={toLines(title)} stagger={120} />
              </h1>
            </div>

            {/* The document itself, directly under the head — one section, so
                there is no dead band between the title and the first block. */}
            <ul className="mt-14 grid grid-cols-1 gap-5 lg:mt-16 lg:gap-6">
              {blocks.map((b, i) => (
                <Reveal key={i} dir="up" delay={Math.min(i, 4) * 60} as="li" threshold={0.08}>
                  <article className="relative flex h-full flex-col rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur-sm transition-[border-color] duration-500 hover:border-accent-bright/45 sm:p-6 lg:p-7">
                    <p className={NUM_PILL}>{String(i + 1).padStart(2, "0")}</p>

                    {b.heading && (
                      <h2 className="mt-5 hyphens-auto break-words text-[1.05rem] font-semibold leading-[1.25] tracking-[-0.02em] text-ink sm:text-[1.15rem]">
                        {b.heading}
                      </h2>
                    )}

                    <p
                      className={`whitespace-pre-line text-[13.5px] leading-[1.7] text-ink-2 ${
                        b.heading ? "mt-3" : "mt-5"
                      }`}
                    >
                      {b.text}
                    </p>

                    <span
                      aria-hidden="true"
                      className="mt-6 block h-px w-full bg-accent-bright/45"
                    />
                  </article>
                </Reveal>
              ))}
            </ul>

            <Reveal dir="up" delay={80}>
              <p className="mt-12">
                <a href="/" className="le-link text-[13.5px]">
                  ← {t.about.page.backLabel}
                </a>
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer onSubpage />
    </>
  );
}
