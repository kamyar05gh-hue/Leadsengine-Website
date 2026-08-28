/**
 * Brand-level facts, identical across languages. Contact details come from
 * the Future Media report; the domain is an assumption recorded in
 * memory/DECISIONS.md.
 */
export const SITE = {
  brand: "Leads Engine",
  company: "Future Media GmbH",
  domain: "https://leadsengine.ch",
  /* The single conversion action on the page — every `pm-cta` on the site
     resolves to this one URL, so the destination can be changed in exactly
     one place and no button can be left pointing at the old one.

     IT IS OUR OWN PAGE NOW. It was a Heyflow funnel on someone else's domain,
     which cost three things: the visitor left leadsengine.ch mid-decision,
     the analytics trail ended at the boundary, and the `#kundengewinnung`
     anchor we were asked to link to did not exist in that flow, so every
     click landed on its first screen regardless. /analyse/ collects the same
     information in our own type and colour, in one page rather than five
     steps, and posts it to our own endpoint.

     A RELATIVE URL, DELIBERATELY. `PrimaryCta` opens external destinations in
     a new tab; an internal one must stay in the same tab, and it keys off
     exactly this. */
  ctaUrl: "/analyse/",
  /* FUTURE MEDIA's own details. The Impressum is Future Media GmbH's legal
     notice, so these are the ones that belong there and in the JSON-LD. */
  email: "info@future-media.ch",
  phone: "078 799 35 17",
  phoneHref: "tel:+41787993517",
  web: "www.future-media.ch",
  webHref: "https://www.future-media.ch",

  /* LEADS ENGINE's own contact, for the footer form and contact block. Kept
     separate from the fields above on purpose: pointing the product's contact
     at Future Media's inbox would be wrong, and overwriting those would
     silently change the Impressum, which must stay the legal entity's. */
  contact: {
    email: "info@leadsengine.ch",
    emailHref: "mailto:info@leadsengine.ch",
    phone: "+41 79 488 00 11",
    phoneHref: "tel:+41794880011",
  },
  locations: [
    { city: "Bern", address: "Weltpoststrasse 5, 3015 Bern" },
    { city: "Zürich", address: "Hardstrasse 201, 8005 Zürich" },
  ],
  /* Future Media references shown in the "Trusted by" band under the hero.
     A text wordmark renders by default; a file at `public/logos/<slug>.svg`
     (or .png) takes over the moment it exists — see public/logos/README.md.
     Either way the band paints them a single brand blue, so a coloured
     source logo still matches the row.

     Names transcribed from the client's supplied logo sheet. Several images
     on that sheet are near-white on white and could not be read with
     confidence; those are NOT guessed at here. Add them to this list as their
     files arrive. */
  references: [
    { name: "Universität Bern", slug: "uni-bern" },
    { name: "Mazda", slug: "mazda" },
    { name: "SBB", slug: "sbb" },
    { name: "WESCO", slug: "wesco" },
    { name: "Nau.ch", slug: "nau" },
    { name: "Bildung Bern", slug: "bildung-bern" },
    { name: "Spitex Region Lueg", slug: "spitex" },
    { name: "Stiftung für Betagte", slug: "stiftung-betagte" },
    { name: "Böhler AG", slug: "boehler" },
    { name: "Jobdoor", slug: "jobdoor" },
    { name: "Keyken", slug: "keyken" },
    { name: "mabalu", slug: "mabalu" },
    { name: "Victorinox", slug: "victorinox" },
    { name: "Transsicura", slug: "transsicura" },
  ],
};
