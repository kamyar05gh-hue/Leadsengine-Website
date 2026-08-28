import { useId, useState } from "react";
import { ArrowRight, Check, ShieldCheck, Star } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { SITE } from "@/constants/site";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { toLines } from "@/lib/toLines";

/**
 * "Kostenlose KI-Analyse anfordern" — the one conversion page.
 *
 * WHY IT EXISTS. Every CTA on the site used to open an external Heyflow
 * funnel. That funnel asked one question per screen behind a progress bar,
 * and it lived on someone else's domain: the visitor left leadsengine.ch, the
 * analytics trail ended, and the fragment we linked to did not resolve to
 * anything in the flow. This page replaces it on our own domain, in our own
 * type and colour.
 *
 * ONE PAGE, NOT A SEQUENCE — the client was explicit, and it is also the
 * right call. A five-field form split across five screens multiplies the
 * number of moments a visitor can abandon by five, and buys nothing: the
 * fields are short enough to see at once, and seeing all of them is what
 * tells someone the whole thing takes a minute. The progress bar in the
 * reference exists to reassure you that a long form will end; a form with no
 * steps does not need reassuring about.
 *
 * TRUST SITS BESIDE THE FORM, NOT UNDER IT. The three testimonials and the
 * "what happens next" steps are in the same viewport as the fields on a
 * desktop, because they answer the question a person asks WHILE deciding to
 * type, not after. On a phone they fall below, where the form comes first.
 *
 * SUBMISSION goes to `/api/lead.php` on this same origin — see the header of
 * that file for what it does with it and why. No third-party form service, no
 * cross-origin request, nothing for the CSP to allow beyond `'self'`.
 */

type Fields = "name" | "email" | "phone" | "role" | "website";
type Errors = Partial<Record<Fields | "consent", string>>;

const EMPTY: Record<Fields, string> = { name: "", email: "", phone: "", role: "", website: "" };

export default function Analyse() {
  const { t } = useLang();
  const a = t.analyse;
  const uid = useId();

  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const set = (k: Fields) => (v: string) => setValues((s) => ({ ...s, [k]: v }));

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
        body: JSON.stringify({
          ...values,
          consent,
          /* Bots fill every field they find. A real visitor never sees this
             one, so anything in it is a machine — see lead.php. */
          company_website_url: "",
          lang: t.meta.lang,
        }),
      });
      /* A 200 IS NOT A SUCCESS. If PHP ever stops executing on the host, the
         server answers 200 and hands back the source of lead.php as text —
         `res.ok` is true and the visitor is told their request went through
         while it went nowhere. Exactly this bit the dashboard proxy once.
         So the body has to parse as JSON AND say so. */
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.ok !== true) throw new Error(String(res.status));
      setState("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setState("failed");
    }
  };

  /* Same focus treatment as the footer form: a soft halo rather than a hard
     ring, so a focused field and a live button read as one language. */
  const fieldBase =
    "w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-ink " +
    "placeholder:text-ink-3/70 transition-[border-color,background-color,box-shadow] " +
    "duration-200 focus:outline-none focus:ring-4 focus:ring-gold-vivid/10 " +
    "focus:border-gold-vivid/70";

  const Field = ({
    k,
    label,
    placeholder,
    type = "text",
    autoComplete,
    inputMode,
  }: {
    k: Fields;
    label: string;
    placeholder: string;
    type?: string;
    autoComplete?: string;
    inputMode?: "email" | "tel" | "url" | "text";
  }) => {
    const id = `${uid}-${k}`;
    const bad = errors[k];
    return (
      <div>
        <label
          className="block text-[10.5px] font-semibold uppercase tracking-[0.13em] text-ink-3"
          htmlFor={id}
        >
          {label}{" "}
          <span className="text-gold-vivid" title={a.required} aria-hidden="true">
            *
          </span>
        </label>
        <input
          id={id}
          name={k}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={values[k]}
          aria-invalid={bad ? true : undefined}
          aria-describedby={bad ? `${id}-err` : undefined}
          onChange={(e) => set(k)(e.target.value)}
          className={
            `mt-2 ${fieldBase} ` +
            (bad
              ? "border-[rgb(214,82,74)]/70 bg-[rgb(214,82,74)]/[0.06]"
              : "border-white/[0.09] bg-white/[0.025] hover:border-white/[0.16]")
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
  };

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Header onSubpage current="/analyse/" />

      <main>
        <section className="le-noise relative overflow-clip bg-bg pb-[clamp(3.5rem,6vw,5rem)] pt-28 lg:pt-32">
          <div className="le-aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="le-container relative">
            {state === "sent" ? (
              /* THE WHOLE PAGE BECOMES THE CONFIRMATION. A banner above a form
                 the visitor has already completed invites them to fill it in
                 again; replacing the form removes that entirely. */
              <div className="mx-auto max-w-[46rem] text-center">
                <span
                  aria-hidden="true"
                  className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold-vivid/35 bg-gold-vivid/[0.10] text-gold-vivid"
                >
                  <Check className="h-7 w-7" strokeWidth={2} />
                </span>
                <h1 className="mt-7 text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.14] tracking-[-0.025em] text-ink">
                  {a.successTitle}
                </h1>
                <p className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-ink-2">
                  {a.successBody}
                </p>
                <p className="mt-8">
                  <a href="/" className="le-link text-[13.5px]">
                    ← {a.successBack}
                  </a>
                </p>
              </div>
            ) : (
              <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
                {/* ------------------------------------------------ left */}
                <div className="min-w-0">
                  <Reveal dir="down" eager>
                    <p className="le-kicker flex items-center gap-2.5 text-[9.5px] tracking-[0.16em] sm:text-[10px]">
                      <span aria-hidden="true" className="block h-px w-6 bg-accent-bright" />
                      {a.kicker}
                    </p>
                  </Reveal>

                  <h1 className="mt-5 text-[clamp(1.9rem,3.8vw,2.75rem)] font-semibold leading-[1.13] tracking-[-0.03em] text-ink">
                    <RevealText lines={toLines(a.title)} stagger={110} />
                  </h1>

                  <Reveal delay={90} eager>
                    <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.7] text-ink-2">
                      {a.lead}
                    </p>
                  </Reveal>

                  <Reveal delay={150} eager>
                    <ul className="mt-7 flex flex-col gap-3">
                      {a.assurances.map((line) => (
                        <li key={line} className="flex items-center gap-2.5">
                          <Check
                            aria-hidden="true"
                            strokeWidth={2.4}
                            className="h-[15px] w-[15px] shrink-0 text-gold-vivid"
                          />
                          <span className="text-[14px] leading-[1.5] text-ink-2">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>

                  {/* ---------------- what happens next ---------------- */}
                  <Reveal dir="up" className="mt-12 lg:mt-14">
                    <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink-3">
                      {a.stepsTitle}
                    </h2>
                    <ol className="mt-6 flex flex-col gap-6">
                      {a.steps.map((s, i) => (
                        <li key={s.title} className="flex gap-4">
                          <span
                            aria-hidden="true"
                            className="le-mono mt-px grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line-strong text-[11.5px] font-semibold text-ink-3"
                          >
                            {i + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[14.5px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink">
                              {s.title}
                            </span>
                            <span className="mt-1.5 block max-w-[46ch] text-[13.5px] leading-[1.65] text-ink-3">
                              {s.body}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Reveal>

                  {/* ---------------- trust ---------------- */}
                  <Reveal dir="up" className="mt-12 lg:mt-14">
                    <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink-3">
                      {a.trustTitle}
                    </h2>
                    <div className="mt-6 flex flex-col gap-5">
                      {t.testimonials.items.slice(0, 3).map((item) => (
                        <figure
                          key={item.name}
                          className="rounded-2xl border border-line bg-surface/85 p-5"
                        >
                          <span aria-hidden="true" className="flex gap-0.5 text-gold-vivid">
                            {[0, 1, 2, 3, 4].map((n) => (
                              <Star key={n} className="h-3 w-3 fill-current" />
                            ))}
                          </span>
                          <blockquote className="mt-3 text-[13.5px] leading-[1.65] text-ink-2">
                            {item.quote}
                          </blockquote>
                          <figcaption className="mt-3 text-[12px] leading-snug text-ink-3">
                            <span className="font-semibold text-ink">{item.name}</span>
                            {" · "}
                            {item.role}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </Reveal>
                </div>

                {/* ------------------------------------------------ right */}
                <div className="min-w-0">
                  {/* `lg:sticky` so the form stays with the reader as they
                      scroll the trust column — it is the thing the page is
                      for, and it should never be off screen. */}
                  <div className="lg:sticky lg:top-24">
                    <Reveal dir="up" delay={60} eager>
                      <div className="rounded-2xl border border-line bg-surface/85 p-6 sm:p-7">
                        <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
                          {a.formTitle}
                        </h2>
                        <p className="mt-2 text-[13px] leading-[1.6] text-ink-3">{a.formLead}</p>

                        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
                          <Field
                            k="name"
                            label={a.fields.name}
                            placeholder={a.fields.namePlaceholder}
                            autoComplete="name"
                          />
                          <Field
                            k="email"
                            label={a.fields.email}
                            placeholder={a.fields.emailPlaceholder}
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                          />
                          <Field
                            k="phone"
                            label={a.fields.phone}
                            placeholder={a.fields.phonePlaceholder}
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                          />
                          <Field
                            k="role"
                            label={a.fields.role}
                            placeholder={a.fields.rolePlaceholder}
                            autoComplete="organization-title"
                          />
                          <Field
                            k="website"
                            label={a.fields.website}
                            placeholder={a.fields.websitePlaceholder}
                            inputMode="url"
                            autoComplete="url"
                          />

                          {/* HONEYPOT. Off screen rather than `display:none`,
                              which some bots skip, and never focusable or
                              announced. A human cannot reach it. */}
                          <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                            <label htmlFor={`${uid}-hp`}>Website URL</label>
                            <input
                              id={`${uid}-hp`}
                              name="company_website_url"
                              type="text"
                              tabIndex={-1}
                              autoComplete="off"
                            />
                          </div>

                          <div className="pt-1">
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                aria-invalid={errors.consent ? true : undefined}
                                className="mt-0.5 h-[17px] w-[17px] shrink-0 cursor-pointer rounded border-white/20 bg-white/[0.04] accent-[rgb(var(--le-gold-vivid-rgb))]"
                              />
                              <span className="text-[12.5px] leading-[1.55] text-ink-3">
                                {a.privacyBefore}{" "}
                                <a href="/datenschutz/" className="le-link">
                                  {a.privacyLink}
                                </a>{" "}
                                {a.privacyAfter}
                              </span>
                            </label>
                            {errors.consent && (
                              <span className="mt-2 block text-[11.5px] leading-snug text-[rgb(214,82,74)]">
                                {errors.consent}
                              </span>
                            )}
                          </div>

                          <div className="pt-1.5">
                            <button
                              type="submit"
                              disabled={state === "sending"}
                              className="le-cta-pill group w-full px-6 py-3 text-[14.5px] disabled:cursor-wait disabled:opacity-70"
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
                              className="mt-3 min-h-[18px] text-center text-[12px] leading-snug"
                            >
                              {state === "failed" && (
                                <span className="text-[rgb(214,82,74)]">{a.errors.failed}</span>
                              )}
                            </p>

                            <p className="mt-1 flex items-center justify-center gap-2 text-[11.5px] text-ink-3">
                              <ShieldCheck
                                aria-hidden="true"
                                strokeWidth={1.9}
                                className="h-[14px] w-[14px] shrink-0 text-gold-vivid"
                              />
                              {SITE.contact.email}
                            </p>
                          </div>
                        </form>
                      </div>
                    </Reveal>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer onSubpage />
    </>
  );
}
