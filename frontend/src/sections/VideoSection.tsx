import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import VideoPlayer from "@/components/VideoPlayer";
import { toLines } from "@/lib/toLines";

/**
 * The explainer video, directly after the trust block.
 *
 * PLACEMENT. It follows the logos and the three ticks because that is the
 * moment the argument has been asserted but not yet shown: the visitor has
 * just read who trusts us and why we are credible, and the fastest way to
 * make the rest of the page land is two minutes of watching the problem
 * happen. Everything below it then reads as elaboration rather than as setup.
 *
 * The section is deliberately plain — kicker, headline, one line, the frame.
 * The video is the visual; wrapping it in cards or washes would compete with
 * the thing it is meant to introduce.
 */
export default function VideoSection() {
  const { t } = useLang();
  const v = t.video;

  return (
    <section
      id="video"
      aria-labelledby="video-title"
      className="le-noise le-section relative scroll-mt-24 overflow-hidden bg-bg-alt"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[860px] max-w-[140vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--le-accent-rgb) / 0.22), transparent 70%)",
        }}
      />

      <div className="le-container relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal dir="up">
            <div className="flex items-center justify-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
              <p className="le-kicker">{v.kicker}</p>
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
            </div>
          </Reveal>

          <h2
            id="video-title"
            className="mt-6 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-ink"
          >
            <RevealText lines={toLines(v.title)} delay={60} stagger={110} />
          </h2>

          <Reveal dir="up" delay={140}>
            <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-[1.7] text-ink-2">
              {v.lead}
            </p>
          </Reveal>
        </div>

        {/* `defaultQuality: 1` is 720p — the middle rung. 480p would look
            soft on a laptop and 1080p is 18 MB, which is not a default to
            impose on anyone; whoever wants it can choose it. */}
        <Reveal dir="up" delay={120}>
          <div className="relative mx-auto mt-12 max-w-4xl lg:mt-14">
            {/* The ambient half of the gold light. The player's own box-shadow
                lights the edge; this pools underneath and behind it so the
                glow has somewhere to fall off to. Sized larger than the frame
                and pushed down, because a halo centred on the object reads as
                a sticker outline rather than as light. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-16 -bottom-24 top-10 rounded-[50%] blur-3xl"
              style={{
                /* Halved with the frame's own glow — see the note there. */
                background:
                  "radial-gradient(ellipse at center, rgb(var(--le-gold-rgb) / 0.14), transparent 70%)",
              }}
            />
            <VideoPlayer
              qualities={[
                { label: "480p", src: "/video/leads-engine-480.mp4" },
                { label: "720p", src: "/video/leads-engine-720.mp4" },
                { label: "1080p", src: "/video/leads-engine-1080.mp4" },
              ]}
              defaultQuality={1}
              poster="/video/leads-engine-poster.jpg"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
