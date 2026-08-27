import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import TeamGrid from "@/components/TeamGrid";

/**
 * The roster, on the main page: kicker, one line, six cards. Placed right
 * after the voices that talk ABOUT Leads Engine — this is the page's one
 * beat that says who is actually behind it, then hands straight back to the
 * FAQ and the CTA.
 *
 * Structurally this is now a full section like any other: the noise layer,
 * one radial wash for temperature, the `le-container relative` shell and the
 * hairline+kicker head. It previously had none of that and sat flat on the
 * background between two fully-dressed neighbours, which is what made it
 * read as unfinished.
 */
export default function Team() {
  const { t } = useLang();

  return (
    <section
      id="team"
      aria-labelledby="team-title"
      className="le-noise le-section relative scroll-mt-24 overflow-hidden bg-bg"
    >
      {/* One cool light source, mirrored from Benefits' warm one so the two
          sections balance rather than repeat. Static: it sets temperature,
          it does not perform. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[820px] max-w-[130vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(var(--le-accent-rgb) / 0.22), transparent 68%)",
        }}
      />

      <div className="le-container relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal dir="up">
            <div className="flex items-center justify-center gap-3">
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
              <p className="le-kicker">{t.about.teamKicker}</p>
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
            </div>
          </Reveal>

          <h2
            id="team-title"
            className="mt-6 text-[clamp(1.6rem,2.6vw,2.25rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-ink"
          >
            <RevealText lines={[t.about.teamTitle]} delay={60} />
          </h2>

          {/* WHO ACTUALLY BUILDS THIS, stated before the faces rather than
              left to be inferred from them. Six portraits with no sentence
              above them read as a startup team photo; the sentence is what
              turns them into seven years of agency work. */}
          <Reveal dir="up" delay={140}>
            <p className="mx-auto mt-5 max-w-[46ch] text-[14.5px] leading-[1.65] text-ink-2">
              {t.about.teamLead}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 lg:mt-16">
          <TeamGrid size={112} />
        </div>
      </div>
    </section>
  );
}
