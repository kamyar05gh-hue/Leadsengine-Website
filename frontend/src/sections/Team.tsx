import { useLang } from "@/i18n/LanguageContext";
import Reveal from "@/components/Reveal";
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
      aria-labelledby="team-kicker"
      className="le-noise relative scroll-mt-24 overflow-hidden bg-bg pb-[clamp(3.5rem,6vw,5.5rem)] pt-[clamp(2rem,3.5vw,3rem)]"
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
              <p id="team-kicker" className="le-kicker">
                {t.about.teamKicker}
              </p>
              <span aria-hidden="true" className="h-px w-7 bg-accent-bright" />
            </div>
          </Reveal>

          {/* THE HEADLINE AND THE LEAD PARAGRAPH WERE REMOVED, BY
              INSTRUCTION. The kicker above now carries the section on its
              own, and it is what labels the section for assistive tech —
              see `aria-labelledby` on the <section>, which used to point at
              the h2 that is no longer here. */}
        </div>

        <div className="mt-12 lg:mt-16">
          <TeamGrid size={112} />
        </div>
      </div>
    </section>
  );
}
