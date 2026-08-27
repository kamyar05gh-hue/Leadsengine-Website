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

  /* Compact, at the client's request: the row height comes down from ~42px to
     ~36px and the label sits tighter to its field, so the four rows read as
     one block instead of four stacked pairs. Nothing is removed — every label,
     required marker and error message stays — it is only tightened. */
  const fieldBase =
    "w-full rounded-lg border bg-surface/50 px-3 py-2 text-[13.5px] text-ink " +
    "placeholder:text-ink-3 transition-colors duration-200 focus:outline-none " +
    "focus:ring-1 focus:ring-accent-bright/40 focus:border-accent-bright";

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
    const cls = `mt-1.5 ${fieldBase} ${bad ? "border-[rgb(214,82,74)]" : "border-line"}`;
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
          className="block text-[12px] font-medium tracking-[-0.005em] text-ink-2"
          htmlFor={id}
        >
          {label} <span className="text-gold-vivid" title={f.required}>*</span>
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
    <form onSubmit={submit} noValidate className="space-y-3.5">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 pt-0.5">
        <p className="max-w-[42ch] text-[11.5px] leading-relaxed text-ink-3">{f.privacy}</p>

        <div className="flex items-center gap-3">
          {/* Announced politely so a screen reader hears it without the focus
              being pulled out of the form. */}
          <p role="status" aria-live="polite" className="text-[12.5px]">
            {sent && (
              <span className="inline-flex items-center gap-1.5 text-success">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {f.sent}
              </span>
            )}
          </p>
          <button
            type="submit"
            className="group inline-flex items-center gap-2 rounded-full bg-cta px-6 py-2.5 text-[14px] font-semibold text-white transition-colors duration-300 hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/60"
          >
            {f.submit}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </form>
  );
}
