import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import Reveal from "@/components/Reveal";

/**
 * "Kostenlose KI-Analyse" — the one conversion page.
 *
 * DELIBERATELY ALMOST EMPTY. The first version of this page carried three
 * paragraphs, a numbered "what happens next" explainer and three testimonial
 * cards beside the form. The client's verdict was that it was complicated,
 * and they were right: a person arrives here having ALREADY decided — they
 * clicked a button that said "Kostenlose Analyse". Everything on the page
 * after that point is either the form or an obstacle in front of it.
 *
 * So what is left is a heading, one line, five fields, a consent box and a
 * button, in a single centred column. No columns to choose between, no
 * scrolling to find the form, nothing to read past.
 *
 * The trust content was not moved elsewhere, it was removed. The testimonials
 * still live on the home page, which is where someone is still deciding; here
 * they would be answering a question that has already been answered.
 *
 * ONE PAGE, NOT A SEQUENCE. Five short fields fit in one view, and seeing all
 * of them at once is what tells a visitor this takes a minute — which a
 * progress bar over five screens can only promise.
 *
 * Submission goes to `/api/lead.php` on this same origin; see that file for
 * what happens to it and why it writes to disk before it mails.
 */

type Field = "name" | "email" | "phone" | "role" | "website";
type Errors = Partial<Record<Field | "consent", string>>;

const ORDER: Field[] = ["name", "email", "phone", "role", "website"];
const EMPTY: Record<Field, string> = { name: "", email: "", phone: "", role: "", website: "" };

/** Per-field input semantics, so mobile keyboards and autofill behave. */
const INPUT: Record<Field, { type: string; autoComplete: string; inputMode?: "email" | "tel" | "url" }> = {
  name: { type: "text", autoComplete: "name" },
  email: { type: "email", autoComplete: "email", inputMode: "email" },
  phone: { type: "tel", autoComplete: "tel", inputMode: "tel" },
  role: { type: "text", autoComplete: "organization-title" },
  website: { type: "text", autoComplete: "url", inputMode: "url" },
};

export default function Analyse() {
  const { t } = useLang();
  const a = t.analyse;
  const uid = useId();

  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const validate = () => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = a.errors.name;
    if (!values.email.trim()) next.email = a.errors.email;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next.email = a.errors.emailInvalid;
    if (!values.phone.trim()) next.phone = a.errors.phone;
    if (!values.role.trim()) next.role = a.errors.role;
    if (!values.website.trim()) next.website = a.errors.website;
    if (!consent) next.consent = a.errors.consent;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    if (!validate()) return;
    setState("sending");
    try {
      const res = await fetch("/api/lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, consent, company_website_url: "", lang: t.meta.lang }),
      });
      /* A 200 IS NOT A SUCCESS. If PHP ever stops executing, the server
         answers 200 with the source of lead.php and `res.ok` is true — the
         visitor would be told their request went through while it went
         nowhere. The body has to parse as JSON and say so. */
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.ok !== true) throw new Error(String(res.status));
      setState("sent");
    } catch {
      setState("failed");
    }
  };

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header onSubpage current="/analyse/" />

      <main>
        {/* `min-h` with the header and footer subtracted, so the column is
            vertically centred in what is actually left of the screen rather
            than in the document. */}
        <section className="le-noise relative flex min-h-[calc(100svh-56px)] items-center overflow-clip bg-bg px-0 py-24 lg:py-28">
          <div className="le-aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="le-container relative w-full">
            {/* ONE COLUMN, CENTRED, at a width that keeps the fields
                comfortably wide without the line length of the heading
                sprawling. */}
            <div className="mx-auto w-full max-w-[27rem]">
              {state === "sent" ? (
                <div className="text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold-vivid/35 bg-gold-vivid/[0.10] text-gold-vivid"
                  >
                    <Check className="h-7 w-7" strokeWidth={2} />
                  </span>
                  <h1 className="mt-7 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-[1.16] tracking-[-0.025em] text-ink">
                    {a.successTitle}
                  </h1>
                  <p className="mx-auto mt-4 max-w-[38ch] text-[14.5px] leading-[1.65] text-ink-2">
                    {a.successBody}
                  </p>
                  <p className="mt-7">
                    <a href="/" className="le-link text-[13.5px]">
                      ← {a.successBack}
                    </a>
                  </p>
                </div>
              ) : (
                <Reveal dir="up" eager>
                  <div className="text-center">
                    <p className="le-kicker text-[9.5px] tracking-[0.18em] sm:text-[10px]">
                      {a.kicker}
                    </p>
                    <h1 className="mt-4 text-[clamp(1.7rem,3.4vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.028em] text-ink">
                      {a.title}
                    </h1>
                    <p className="mx-auto mt-3.5 max-w-[34ch] text-[14px] leading-[1.6] text-ink-3">
                      {a.lead}
                    </p>
                  </div>

                  <form onSubmit={submit} noValidate className="mt-9 space-y-3.5">
                    {ORDER.map((k) => {
                      const id = `${uid}-${k}`;
                      const bad = errors[k];
                      const cfg = INPUT[k];
                      return (
                        <div key={k}>
                          {/* The label is the placeholder's job here — five
                              short, self-evident fields do not each need a
                              caption above them, and removing ten lines of
                              small caps is most of what made the page feel
                              busy. It stays in the DOM for assistive tech. */}
                          <label htmlFor={id} className="sr-only">
                            {a.fields[k]}
                          </label>
                          <input
                            id={id}
                            name={k}
                            type={cfg.type}
                            inputMode={cfg.inputMode}
                            autoComplete={cfg.autoComplete}
                            placeholder={a.fields[k]}
                            value={values[k]}
                            aria-invalid={bad ? true : undefined}
                            aria-describedby={bad ? `${id}-err` : undefined}
                            onChange={(e) =>
                              setValues((s) => ({ ...s, [k]: e.target.value }))
                            }
                            className={
                              "w-full rounded-xl border px-4 py-3 text-[14.5px] text-ink " +
                              "placeholder:text-ink-3/75 transition-[border-color,background-color,box-shadow] " +
                              "duration-200 focus:outline-none focus:ring-4 focus:ring-gold-vivid/10 " +
                              "focus:border-gold-vivid/70 " +
                              (bad
                                ? "border-[rgb(214,82,74)]/70 bg-[rgb(214,82,74)]/[0.06]"
                                : "border-white/[0.10] bg-white/[0.025] hover:border-white/[0.18]")
                            }
                          />
                          {bad && (
                            <span
                              id={`${id}-err`}
                              className="mt-1.5 block text-[11.5px] leading-snug text-[rgb(214,82,74)]"
                            >
                              {bad}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* HONEYPOT — off screen, never focusable, invisible to a
                        person. Anything in it is a machine; see lead.php. */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
                    >
                      <label htmlFor={`${uid}-hp`}>Website URL</label>
                      <input
                        id={`${uid}-hp`}
                        name="company_website_url"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <div className="pt-1.5">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="le-check"
                          checked={consent}
                          aria-invalid={errors.consent ? true : undefined}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        <span className="text-[13px] leading-[1.5] text-ink-2">
                          {a.consentShort}{" "}
                          <a
                            href="/datenschutz/"
                            className="le-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {a.privacyLink}
                          </a>
                        </span>
                      </label>
                      {errors.consent && (
                        <span className="mt-2 block text-[11.5px] leading-snug text-[rgb(214,82,74)]">
                          {errors.consent}
                        </span>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={state === "sending"}
                        className="le-cta-pill group w-full px-6 py-3.5 text-[15px] disabled:cursor-wait disabled:opacity-70"
                      >
                        {state === "sending" ? a.submitting : a.submit}
                        {state !== "sending" && (
                          <ArrowRight
                            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        )}
                      </button>

                      <p
                        role="status"
                        aria-live="polite"
                        className="mt-3 min-h-[16px] text-center text-[12px] leading-snug"
                      >
                        {state === "failed" && (
                          <span className="text-[rgb(214,82,74)]">{a.errors.failed}</span>
                        )}
                      </p>
                    </div>
                  </form>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer onSubpage />
    </>
  );
}
