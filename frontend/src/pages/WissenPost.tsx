import { useLang } from "@/i18n/LanguageContext";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { toLines } from "@/lib/toLines";

/** Every post the desk has published, keyed the same way on both dictionaries. */
export type WissenSlug = "wasIstGeo";

const NUM_PILL =
  "le-mono w-fit rounded-full border border-gold-vivid/30 bg-gold-vivid/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-bright";

/**
 * One Wissen article — first entry, /wissen/was-ist-geo/.
 *
 * SAME CONSTRUCTION AS `Legal.tsx` AND `About.tsx`: the headline shares its
 * section with the intro instead of standing alone behind a full band of its
 * own padding, and gold is spent on the numerals and the FAQ so the page is
 * not one cold hue end to end.
 *
 * WHY THIS IS NOT A MARKDOWN FILE. The Two-Desk Playbook describes a
 * content/posts/*.md pipeline as the target mechanism once there are enough
 * posts to justify one. For a first post, mirroring the working
 * dictionary-driven pattern this codebase already uses for About and Legal
 * is the smaller, lower-risk move — no new toolchain, no new failure mode,
 * and `scripts/seo.mjs`'s fallback+JSON-LD mechanism already knows how to
 * read a dictionary. Revisit the markdown pipeline once a second or third
 * post makes hand-adding dictionary entries the slower path.
 *
 * `slug` is fixed to `WissenSlug` rather than a free string: every value has
 * to exist as a key in `t.wissen.posts` on BOTH dictionaries, and a typo'd
 * slug should fail at compile time, not as a blank page in production.
 */
export default function WissenPost({ slug }: { slug: WissenSlug }) {
  const { t } = useLang();
  const post = t.wissen.posts[slug];

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header onSubpage />

      <main>
        <section
          aria-labelledby="wissen-post-title"
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
                  {post.kicker}
                </p>
              </Reveal>

              <h1
                id="wissen-post-title"
                className="mt-5 text-[clamp(1.85rem,3.8vw,2.75rem)] font-semibold leading-[1.16] tracking-[-0.03em] text-ink lg:mt-6"
              >
                <RevealText lines={toLines(post.title)} stagger={110} />
              </h1>

              <Reveal dir="up" delay={70}>
                <p className="le-mono mt-5 text-[12px] text-ink-3">
                  {post.dateLabel} · {post.readingTime}
                </p>
              </Reveal>

              <Reveal dir="up" delay={100}>
                <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.7] text-ink-2 lg:text-[16px]">
                  {post.intro}
                </p>
              </Reveal>
            </div>

            {/* Sections: each an H2 the reader could ask verbatim, followed by
                its answer up front — see the Two-Desk Playbook's Stage 4
                structure rule. Numbered pills carry the same gold treatment
                as Legal.tsx, since the sections here really are an ordered
                sequence a reader moves through, unlike a plain feature grid. */}
            <ol className="mt-14 grid grid-cols-1 gap-5 lg:mt-16 lg:gap-6">
              {post.sections.map((s, i) => (
                <Reveal key={i} dir="up" delay={Math.min(i, 4) * 60} as="li" threshold={0.08}>
                  <article className="relative flex h-full flex-col rounded-2xl border border-line bg-surface/85 p-5 sm:p-6 lg:p-7">
                    <p className={NUM_PILL}>{String(i + 1).padStart(2, "0")}</p>

                    <h2 className="mt-5 text-[1.05rem] font-semibold leading-[1.3] tracking-[-0.02em] text-ink sm:text-[1.15rem]">
                      {s.heading}
                    </h2>

                    <div className="mt-3 space-y-3">
                      {s.paragraphs.map((p, j) => (
                        <p key={j} className="text-[13.8px] leading-[1.75] text-ink-2">
                          {p}
                        </p>
                      ))}
                    </div>
                  </article>
                </Reveal>
              ))}
            </ol>

            {/* FAQ — the same questions the FAQPage JSON-LD carries, so a
                visitor and a crawler read the identical text. */}
            <Reveal dir="up" delay={60}>
              <div className="mt-14 max-w-3xl lg:mt-16">
                <h2 className="text-[1.3rem] font-semibold tracking-[-0.02em] text-ink">FAQ</h2>
                <dl className="mt-6 space-y-5">
                  {post.faq.map((f, i) => (
                    <div key={i} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                      <dt className="text-[14.5px] font-semibold text-ink">{f.q}</dt>
                      <dd className="mt-2 text-[13.8px] leading-[1.7] text-ink-2">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal dir="up" delay={80}>
              <div className="mt-12 max-w-3xl border-t border-line pt-8">
                <p className="text-[12px] leading-[1.7] text-ink-3">{post.sourcesNote}</p>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <a href="/analyse/" className="le-cta-pill">
                    {t.cta.primary}
                  </a>
                  <a href="/wissen/" className="le-link text-[13.5px]">
                    ← {t.nav.wissen}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer onSubpage />
    </>
  );
}
