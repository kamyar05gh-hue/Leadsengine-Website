import { useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";

/**
 * FAQ.
 *
 * `item.a` is rendered verbatim and never transformed — the same eight strings
 * are mirrored byte-for-byte into the FAQPage JSON-LD in index.html, and any
 * drift silently breaks the rich result.
 *
 * ---------------------------------------------------------------------------
 * The "the FAQ does not scroll" bug, and why this section is one column now
 * ---------------------------------------------------------------------------
 * The reported version was `lg:grid-cols-[0.34fr_0.66fr]` with the heading
 * column carrying `lg:sticky lg:top-28 lg:self-start`. Rebuilt and measured on
 * the real page in a 1912px-wide browser:
 *
 *   heading column height        145px
 *   containing block (grid row)  645px   ← the question list sets the row
 *   viewport minus `top`         891 - 112 = 779px  (836px at 948px tall)
 *
 * A sticky element only has useful travel while its containing block is taller
 * than the space below its `top` offset. 645 < 779, so the moment the section
 * arrived the heading pinned — and stayed pinned. Tracing `getBoundingClientRect().top`
 * of that column across the scroll gave a flat line:
 *
 *   scroll offset from section top   0    100   200   300   400   500   600
 *   heading column top (px)         112   112   112   112   112   112    12
 *
 * 500px of scroll — exactly `645 - 145`, the whole dwell the containing block
 * could offer — during which the left half of the FAQ did not move a pixel
 * while the page moved under it, then it lurched out of frame in the last
 * 145px. And because the entire two-column grid was only 645px tall against an
 * 891px viewport, every question was already on screen: the sticky heading was
 * accompanying a list that never scrolled past it. That is the bug the client
 * saw — the page scrolled, the FAQ appeared not to.
 *
 * The other classic cause was checked and ruled out: walking every ancestor of
 * the sticky column for a non-`visible` overflow returned exactly one hit,
 * `body { overflow-x: clip }`. `clip` (unlike `hidden`) does not establish a
 * scroll container, so it never captured the sticky element. The containing
 * block was the whole story.
 *
 * The fix is the layout, not the symptom: one column, heading above the list,
 * no sticky, no containing-block dependency, nothing that can pin. The section
 * is now taller than the viewport, so it genuinely scrolls. The glow lives in
 * its own `overflow-hidden` wrapper that is a *sibling* of the content, so it
 * clips itself and never becomes an ancestor of anything readable — and it is
 * `pointer-events-none`, so it never intercepts a click either.
 *
 * The accordion is CSS-only (`.le-acc-body` grid-rows: no JS measurement, no
 * layout thrash), one row open at a time, and NONE open on load — the section
 * presents as a list of questions, not as one pre-answered question. Rows are
 * separated by hairlines only — no boxes.
 *
 * Every question sits at full `ink` from first paint: a closed row is not a
 * dimmed row, and hover changes nothing about legibility. Open state is
 * carried by a gold rule drawing across the top of the row and by the toggle —
 * both purely visual, both mirrored in ARIA.
 *
 * There is no scroll-linked element in this section any more — the gold
 * reading bar that used to double as the top rule was removed at the
 * client's request.
 */
export default function Faq() {
  const { t } = useLang();
  /* -1 = every row closed. The section opens with all eight questions
     readable as a list; nothing is expanded until the visitor asks for it. */
  const [open, setOpen] = useState<number>(-1);

  const listRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative scroll-mt-24 bg-bg-alt le-section"
    >
      {/* The one glow in this section. Clipped by its own wrapper, which is a
          sibling of the content — it never becomes an ancestor of anything
          readable, and it takes no pointer events. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[340px] w-[640px] max-w-[140vw] rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="le-container relative">
        {/* One column. Nothing in this subtree is `position: sticky`, so no
            element depends on a containing block being tall enough to travel. */}
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="le-kicker">{t.faq.kicker}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2
              id="faq-title"
              className="mt-4 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-ink"
            >
              {t.faq.title}
            </h2>
          </Reveal>

          {/* The scroll-linked reading bar that used to live here is gone at
              the client's request. A plain hairline still closes the heading
              off from the list — it just no longer tracks the scroll. */}
          <div aria-hidden="true" className="mt-9 h-px w-full bg-line-strong lg:mt-11" />

          <div ref={listRef}>
            {t.faq.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={item.q} delay={i * 55} threshold={0.05}>
                  <div className="relative border-b border-line">
                    {/* Gold rule drawing across the top of the open row. */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-0 right-0 top-0 h-px origin-left bg-gold transition-transform duration-500 [transition-timing-function:var(--le-ease-out)] ${
                        isOpen ? "scale-x-100" : "scale-x-0"
                      }`}
                    />

                    <h3>
                      <button
                        type="button"
                        id={`faq-trigger-${i}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                        onClick={() => setOpen(isOpen ? -1 : i)}
                        className="group flex w-full items-start gap-4 rounded-md py-4 text-left sm:gap-5 lg:py-5"
                      >
                        <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug tracking-[-0.012em] text-ink lg:text-[16px]">
                          {item.q}
                        </span>

                        {/* The disc: a hairline that goes gold and fills with a
                            gold wash when open. Colour and border only — it
                            never moves, so the row never shifts. */}
                        <span
                          aria-hidden="true"
                          className={`mt-px grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color] duration-[300ms] [transition-timing-function:var(--le-ease)] ${
                            isOpen
                              ? "border-gold-deep bg-gold/[0.12] text-gold-bright"
                              : "border-line bg-transparent text-ink-2 group-hover:border-gold-deep group-hover:text-gold-bright"
                          }`}
                        >
                          {/* Two rounded bars. 135° of travel, not 45 — long
                              enough to read as a movement. Transform only. */}
                          <span
                            className={`relative block h-[11px] w-[11px] transition-transform duration-[380ms] [transition-timing-function:var(--le-ease)] ${
                              isOpen ? "rotate-[135deg]" : "rotate-0"
                            }`}
                          >
                            <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rounded-full bg-current" />
                            <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 rounded-full bg-current" />
                          </span>
                        </span>
                      </button>
                    </h3>

                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      className="le-acc-body"
                      data-open={isOpen}
                    >
                      <div>
                        {/* Verbatim. Never transformed, never truncated.
                            The answer settles a beat after the row has finished
                            opening — opacity and transform only. */}
                        <p
                          style={{
                            opacity: isOpen ? 1 : 0,
                            transform: isOpen ? "none" : "translateY(-6px)",
                            transitionDelay: isOpen ? "140ms" : "0ms",
                          }}
                          className="max-w-[70ch] pb-5 pr-2 text-[14.5px] leading-[1.7] text-ink-2 transition-[opacity,transform] duration-500 [transition-timing-function:var(--le-ease-out)] sm:pr-8"
                        >
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
