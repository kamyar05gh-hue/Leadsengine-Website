import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { SITE } from "@/constants/site";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";

/**
 * Footer — identity, contact, and the one place we ask to be written to.
 *
 * CONTACT DETAILS ARE HERE NOW, BY INSTRUCTION. An earlier client instruction
 * said the opposite — no mail address, no phone, nothing but the Impressum —
 * and this file used to carry a note forbidding it. The client has since
 * asked for a contact form and the contact details in the footer, and given
 * the address and number to use, so that supersedes it. The details shown are
 * LEADS ENGINE's own (`SITE.contact`), not Future Media's: the Impressum is
 * Future Media GmbH's legal notice and still carries theirs.
 *
 * Shape: identity and contact on the left, the form in the middle, the link
 * columns on the right, one light seam, one quiet bottom row. No watermark,
 * no glow.
 *
 * The prop contract is fixed — App.tsx passes `onOpenLegal`, and the legal
 * items stay real buttons that call it, never links.
 *
 * ---------------------------------------------------------------------------
 * Every href here must resolve to an id that exists on the page
 * ---------------------------------------------------------------------------
 * Three sections were removed from the site — Metrics, DashboardPreview and
 * About — taking their anchors with them, and the "process" anchor the old
 * footer pointed at never existed at all. The surviving ids are exactly:
 *
 *   top · problem · blinder-fleck · so-funktionierts · markt · buyer-intent
 *   markt-daten · vorteile · stimmen · zahlen · faq · analyse · footer
 *
 * `links.results` now points at `#zahlen`, the proof-in-numbers block — the
 * same mapping the header nav uses for `nav.results`, so the two agree.
 *
 * `links.process` and `links.about` had no honest destination left, so their
 * dictionary entries were replaced by `data` and `faq`, which do. They
 * are not rendered. A link that lands on the wrong section is worse than a
 * link that is not there: pointing "Über uns" at the testimonials or
 * "Prozess" at "So funktioniert's" would just be a second name for a section
 * that already has one. The dictionary keys stay untouched — if the About
 * section ever comes back, the entry comes back with it.
 */
/** `onSubpage` prefixes the in-page anchors with the home path — see the
 *  same note on `Header`. Everything else is identical on every page. */
export default function Footer(_props: { onSubpage?: boolean } = {}) {
  const { t } = useLang();
  const [year] = useState(() => new Date().getFullYear());
  /* `onSubpage` used to prefix in-page anchors with the home path. Both
     anchor links in this footer are gone now ("Kontakt", then "FAQ"), so
     nothing is left to prefix — the prop stays because the header still
     passes it and it costs nothing to keep the two signatures in step. */

  /* The "Produkt" column was removed at the client's request. Its four links
     (how / benefits / results / market data) all still exist in the header
     nav, so nothing became unreachable.

     "Kontakt" points at the free-analysis section — the one place we ask
     anyone to get in touch. No mail address is exposed here by design. */
  /* One About URL, not one per language. The site carries language in a
     QUERY PARAM (`?lang=en`, see LanguageContext and the hreflang tags in
     index.html), never in the path — an `/en/…` path prefix was a second,
     conflicting convention, and the page now switches language client-side
     exactly like the home page does. */
  /* "Kontakt" removed at the client's request. It pointed at the free-analysis
     section, and this footer already carries the contact form and the full
     contact block (email, phone, address) a few centimetres to the left — the
     link was a third route to something the reader is already looking at. */
  /* "FAQ" removed at the client's request, the same way "Kontakt" was: it
     is one anchor away in the header nav and sits on the page this footer
     is attached to. What is left is the one link that leads somewhere the
     header does not repeat. */
  const companyLinks = [{ href: "/ueber-uns/", label: t.nav.about }];

  /* Real pages, not a modal. They are generated at build time by
     `scripts/legal-pages.mjs` from these same dictionary entries, so they are
     crawlable, linkable and load with no JavaScript at all. */
  const legalLinks = [
    { href: "/impressum/", label: t.footer.links.imprint },
    { href: "/datenschutz/", label: t.footer.links.privacy },
    { href: "/agb/", label: t.footer.links.terms },
  ];

  const heading =
    "text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink-3";
  const link = "le-link text-[13.5px] leading-snug";

  return (
    <footer id="footer" className="relative bg-bg">
      <div className="le-container">
        {/* Identity across the top, then FORM LEFT and CONTACT RIGHT with the
            link columns beside them. On a phone it collapses to one column in
            that same reading order. The form takes the widest share because
            it is the only thing here anyone acts on. */}
        <div className="py-16 lg:py-20">
          <Reveal>
            <div className="max-w-[42ch]">
              <Logo />
              <p className="mt-5 text-[14px] leading-[1.65] text-ink-2">
                {t.footer.tagline}
              </p>
              <p className="mt-2.5 text-[12.5px] leading-[1.6] text-ink-3">
                {t.footer.byline}
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] lg:gap-14 xl:gap-20">
            {/* LEFT — the form */}
            <Reveal delay={70}>
              <div>
                <p className={heading}>{t.footer.form.heading}</p>
                <p className="mt-3 max-w-[44ch] text-[13.5px] leading-[1.6] text-ink-2">
                  {t.footer.contact.lead}
                </p>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </div>
            </Reveal>

            {/* RIGHT — the company's own details. Gold icons, so the block
                reads as a distinct thing beside the form rather than as more
                form furniture. */}
            <Reveal delay={120}>
              <div>
                <p className={heading}>{t.footer.contact.heading}</p>
                <ul className="mt-5 space-y-5">
                  {[
                    {
                      Icon: Mail,
                      label: t.footer.contact.emailLabel,
                      body: (
                        <a href={SITE.contact.emailHref} className={link}>
                          {SITE.contact.email}
                        </a>
                      ),
                    },
                    {
                      Icon: Phone,
                      label: t.footer.contact.phoneLabel,
                      body: (
                        <a href={SITE.contact.phoneHref} className={`${link} le-mono`}>
                          {SITE.contact.phone}
                        </a>
                      ),
                    },
                    {
                      Icon: MapPin,
                      label: t.footer.contact.addressLabel,
                      /* BOTH OFFICES, from `SITE.locations` rather than from a
                         newline-joined string in the dictionary. Bern was the
                         only one shown; Zürich was added at the client's
                         request, and taking both from the constant means the
                         footer, the About page and the JSON-LD can no longer
                         disagree about where the company is — and a third
                         office would appear here with no code change. */
                      body: (
                        <address className="not-italic text-[13.5px] leading-[1.55] text-ink-2">
                          {SITE.locations.map((loc, i) => (
                            <span
                              key={loc.city}
                              className={`block ${i > 0 ? "mt-2.5" : ""}`}
                            >
                              {loc.address}
                            </span>
                          ))}
                        </address>
                      ),
                    },
                  ].map(({ Icon, label, body }) => (
                    <li key={label} className="flex items-start gap-3">
                      {/* Blue, by instruction — the same icon-badge pattern as
                          the trust ticks, so the two now agree. Gold stays for
                          the rating stars only. */}
                      <span
                        aria-hidden="true"
                        className="mt-px grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent-bright/30 bg-accent-bright/[0.07]"
                      >
                        <Icon className="h-3.5 w-3.5 text-accent-bright" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                          {label}
                        </span>
                        <span className="mt-1 block">{body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={170}>
              <div className="grid grid-cols-2 gap-x-10 gap-y-10 lg:gap-x-12">
                <nav aria-label={t.footer.columns.company}>
                  <p className={heading}>{t.footer.columns.company}</p>
                  <ul className="mt-5 space-y-3">
                    {companyLinks.map((item) => (
                      <li key={item.href}>
                        <a href={item.href} className={link}>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <nav aria-label={t.footer.columns.legal}>
                  <p className={heading}>{t.footer.columns.legal}</p>
                  <ul className="mt-5 space-y-3">
                    {legalLinks.map((item) => (
                      <li key={item.href}>
                        <a href={item.href} className={link}>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="le-seam" aria-hidden="true" />

        <div className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-x-6">
            {/* The product holds the line, not the legal entity — the client
                asked for Leads Engine here. Future Media is still credited,
                on the next line and in the byline above. */}
            <p className="text-[12px] leading-relaxed text-ink-3">
              © <span className="le-mono">{year}</span> {SITE.brand}. {t.footer.rights}
            </p>
            <p className="text-[12px] leading-relaxed text-ink-3">{t.footer.madeIn}</p>
            <p className="text-[12px] leading-relaxed text-ink-3">{t.footer.developedBy}</p>
          </div>

          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
