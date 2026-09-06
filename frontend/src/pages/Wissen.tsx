import { useLang } from "@/i18n/LanguageContext";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { toLines } from "@/lib/toLines";

/* Gold numerals — see the note on the same constant in `About.tsx`/`Legal.tsx`. */
const NUM_PILL =
  "le-mono w-fit rounded-full border border-gold-vivid/30 bg-gold-vivid/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-bright";

/**
 * /wissen/ — the Leads Engine desk's own blog index.
 *
 * ONE POST TO START, BUT A REAL INDEX PAGE, not a placeholder. The reason is
 * structural, not cosmetic: a post reachable only from the sitemap is an
 * orphan with no internal link pointing at it, which is one of the clearest
 * signals a page is not really part of a site. This index is what gives the
 * first post — and every one after it — an actual place in the site graph.
 *
 * `t.wissen.posts` is a dictionary, not an array, because each post also
 * needs its own translation keys addressed directly (see `WissenPost.tsx`).
 * `Object.values` here is fine: today it is one entry, and ordering will
 * matter once there are several, at which point a `date` sort belongs here.
 */
export default function Wissen() {
  const { t } = useLang();
  const { index, posts } = t.wissen;
  const list = Object.values(posts);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header onSubpage />

      <main>
        <section
          aria-labelledby="wissen-title"
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
                  {index.kicker}
                </p>
              </Reveal>

              <h1
                id="wissen-title"
                className="mt-5 text-[clamp(2.05rem,4.2vw,3.05rem)] font-semibold leading-[1.13] tracking-[-0.03em] text-ink lg:mt-6"
              >
                <RevealText lines={toLines(index.title)} stagger={120} />
              </h1>

              <Reveal dir="up" delay={80}>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-ink-2 lg:text-[16px]">
                  {index.lead}
                </p>
              </Reveal>
            </div>

            <ul className="mt-14 grid grid-cols-1 gap-5 lg:mt-16 lg:gap-6">
              {list.map((post, i) => (
                <Reveal key={post.slug} dir="up" delay={Math.min(i, 4) * 60} as="li" threshold={0.08}>
                  <a
                    href={`/wissen/${post.slug}/`}
                    className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface/85 p-5 transition-[border-color] duration-500 hover:border-accent-bright/45 sm:p-6 lg:p-7"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={NUM_PILL}>{post.kicker}</p>
                      <p className="le-mono text-[11px] text-ink-3">{post.dateLabel}</p>
                    </div>

                    <h2 className="mt-5 text-[1.15rem] font-semibold leading-[1.3] tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-accent-bright sm:text-[1.3rem]">
                      {post.title}
                    </h2>

                    <p className="mt-3 max-w-[62ch] text-[13.8px] leading-[1.7] text-ink-2">
                      {post.dek}
                    </p>

                    <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-bright">
                      {index.readMore}
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </a>
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
