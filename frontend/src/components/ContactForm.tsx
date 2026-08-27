import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { SITE } from "@/constants/site";

/**
 * The footer contact form.
 *
 * SHAPE follows the client's reference: name, email, phone, message, each
 * label above its field with a required marker, and one submit at the end.
 * The styling is ours, not the reference's — the reference is hairline boxes
 * on flat black, which on this page would read as an unstyled form. These sit
 * on the surface tone the rest of the site uses, with the same radius, the
 * same focus ring as every other control, and the same CTA button. The
 * required marker is gold, tying it to the contact block beside it.
 *
 * HOW IT SUBMITS, AND WHY. There is no backend — this is a static build
 * served as files — so there is nothing to POST to. Rather than pretend (a
 * form that swallows the message and shows a thank-you is worse than no form
 * at all), submitting opens the visitor's mail client with the message
 * already written and addressed to the contact inbox. Nothing is lost and
 * nothing is faked: the visitor sees exactly what is sent, and it arrives
 * from their own address so a reply just works.
 *
 * To move to a real endpoint later, replace the body of `submit` with a fetch
 * to it; the validation, the field state and the sent state all stay.
 *
 * VALIDATION is done here rather than left to the browser so the messages are
 * translated and styled with the rest of the page. `noValidate` turns off the
 * native bubbles; the fields keep their semantic types so mobile keyboards
 * and autofill still behave.
 *
 * THE 2026 PASS — what changed and why, since "slicker" is not a spec:
 *
 *   FIELDS  A single dark inset rather than a bordered box. The border is now
 *           a hairline that only asserts itself on focus, and focus draws a
 *           soft 4px accent halo instead of a hard 1px ring — the same
 *           gesture the CTA pill uses, so a focused field and a hovered
 *           button are visibly the same design language.
 *   LABELS  Small caps, tracked out, muted. They read as field names rather
 *           than as sentences, which lets them sit closer to the input
 *           without the pair blurring together.
 *   BUTTON  Full width and last, not floated right beside the fine print. A
 *           form is a single column of decisions ending in one action; a
 *           button tucked into a row with legal text reads as secondary to
 *           it. It is now the `.le-cta-pill` every other CTA uses, so the
 *           form ends in the same object the rest of the page asks with.
 *   ERRORS  Tinted field, not just red text, so the problem is findable
 *           without reading every message.
 */
type Errors = { name?: string; email?: string; phone?: string; message?: string };

export default function ContactForm() {
  const { t } = useLang();
  const uid = useId();
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const f = t.footer.form;
  const set = (k: keyof typeof values) => (v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = f.errors.name;
    if (!values.email.trim()) next.email = f.errors.email;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next.email = f.errors.emailInvalid;
    if (!values.phone.trim()) next.phone = f.errors.phone;
    if (!values.message.trim()) next.message = f.errors.message;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const subject = `${f.subject}: ${values.name.trim()}`;
    const body =
      `${values.message.trim()}\n\n${values.name.trim()}\n` +
      `${values.email.trim()}\n${values.phone.trim()}`;
    window.location.href =
      `${SITE.contact.emailHref}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  /* Compact, at the client's request: the rows stay tight so the four read as
     one block rather than four stacked pairs. Nothing is removed — every
     label, required marker and error message stays.

     The focus treatment is the point of the restyle: `ring-4` at 10% opacity
     is a HALO, not an outline. A 1px hard ring on a dark form reads as a
     validation error; a soft bloom reads as "this is where you are", and it
     is the same gesture the CTA pill uses on hover. */
  const fieldBase =
    "w-full rounded-xl border px-3.5 py-2.5 text-[14px] text-ink " +
    "placeholder:text-ink-3/70 transition-[border-color,background-color,box-shadow] " +
    "duration-200 focus:outline-none focus:ring-4 focus:ring-accent-bright/10 " +
    "focus:border-accent-bright/70";

  /** One labelled field. Keeps the four rows identical rather than repeated. */
  const Field = ({
    k,
    label,
    placeholder,
    type = "text",
    autoComplete,
    inputMode,
    rows,
  }: {
    k: keyof typeof values;
    label: string;
    placeholder: string;
    type?: string;
    autoComplete?: string;
    inputMode?: "email" | "tel" | "text";
    rows?: number;
  }) => {
    const id = `${uid}-${k}`;
    const bad = errors[k];
    /* A bad field is TINTED, not merely outlined: at a glance the eye finds
       the offending row without reading the four messages under the form. */
    const cls =
      `mt-2 ${fieldBase} ` +
      (bad
        ? "border-[rgb(214,82,74)]/70 bg-[rgb(214,82,74)]/[0.06]"
        : "border-white/[0.09] bg-white/[0.025] hover:border-white/[0.16]");
    const shared = {
      id,
      name: k,
      placeholder,
      value: values[k],
      "aria-invalid": bad ? true : undefined,
      "aria-describedby": bad ? `${id}-err` : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        set(k)(e.target.value),
    };
    return (
      <div>
        <label
          className="block text-[10.5px] font-semibold uppercase tracking-[0.13em] text-ink-3"
          htmlFor={id}
        >
          {label}{" "}
          <span className="text-gold-vivid" title={f.required} aria-hidden="true">
            *
          </span>
        </label>
        {rows ? (
          <textarea {...shared} rows={rows} className={`${cls} resize-y`} />
        ) : (
          <input
            {...shared}
            type={type}
            autoComplete={autoComplete}
            inputMode={inputMode}
            className={cls}
          />
        )}
        {bad && (
          <span id={`${id}-err`} className="mt-1.5 block text-[11.5px] leading-snug text-[rgb(214,82,74)]">
            {bad}
          </span>
        )}
      </div>
    );
  };

  return (
    /* All four fields in ONE grid, so every gap between them is the same
       value. They used to be a two-column row plus two separately-spaced
       full-width fields, which made the rhythm drift down the form. Phone and
       message span both columns; the grid owns the spacing. */
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field k="name" label={f.name} placeholder={f.namePlaceholder} autoComplete="name" />
        <Field
          k="email"
          label={f.email}
          placeholder={f.emailPlaceholder}
          type="email"
          inputMode="email"
          autoComplete="email"
        />
        <div className="sm:col-span-2">
          <Field
            k="phone"
            label={f.phone}
            placeholder={f.phonePlaceholder}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <Field k="message" label={f.message} placeholder={f.messagePlaceholder} rows={4} />
        </div>
      </div>

      {/* THE BUTTON IS FULL WIDTH AND LAST. It used to sit in a row beside the
          privacy note, floated right — which puts the one action of the form
          in visual competition with its fine print, and on a narrow column
          wrapped the two into an awkward stack. A form is a single column of
          decisions ending in one commitment; this is that commitment, at the
          width of the fields it completes.

          It is `.le-cta-pill`, the same object every other CTA on the site
          is, so the form does not end in a button the page uses nowhere
          else. */}
      <div className="pt-1.5">
        <button type="submit" className="le-cta-pill group w-full px-6 py-3 text-[14.5px]">
          {f.submit}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>

        {/* Announced politely so a screen reader hears it without the focus
            being pulled out of the form. Reserved height, so the layout does
            not jump when it appears. */}
        <p
          role="status"
          aria-live="polite"
          className="mt-3 flex min-h-[18px] items-center justify-center text-[12.5px]"
        >
          {sent && (
            <span className="inline-flex items-center gap-1.5 text-success">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {f.sent}
            </span>
          )}
        </p>

        <p className="mt-1 text-center text-[11px] leading-relaxed text-ink-3">{f.privacy}</p>
      </div>
    </form>
  );
}
