/*
 * German (de-CH) — the PRIMARY language. Copy is lifted from the Leads
 * Engine report (Future Media, Report 2026) and the site brief, in the
 * brief's "Du" register. Swiss spelling throughout: «ss», never «ß».
 *
 * `en` is typed from this dictionary, so both stay structurally identical.
 */
export const de = {
  meta: { lang: "de", htmlLang: "de-CH" },

  nav: {
    how: "So funktioniert's",
    results: "Ergebnisse",
    voices: "Stimmen",
    faq: "FAQ",
    about: "Über uns",
    menu: "Menü öffnen",
    close: "Menü schliessen",
  },

  cta: {
    primary: "Kostenlose KI-Analyse starten",
    secondary: "So funktioniert's",
    short: "Kostenlose Analyse",
  },

  hero: {
    eyebrow: "Regionale Sichtbarkeit für Deine Zielgruppe",
    h1: ["Deine Kunden", "googeln nicht mehr."],
    h1Accent: "Sie fragen KI.",
    sub: "Wir machen Dein Unternehmen in ChatGPT & Co. sichtbar.",
    engineLabel:
      "Leads Engine: Unternehmens- und Marktdaten gehen hinein, KI-Plattformen werden analysiert, messbare Sichtbarkeit kommt heraus.",
    platforms: ["ChatGPT", "Google AI", "Claude", "Perplexity", "Grok"],
    scrollHint: "Weiterlesen",
    /* Under the CTA, with a shield mark. The only survivor of the three-tick
       band that used to sit under the logo showcase — the other two claims
       were dropped and this one moved up to where the decision is made. */
    trustLine: "7 Jahre Erfahrung in der Leadgenerierung",
  },



  problem: {
    kicker: "Was sich verändert hat",
    title: "Früher wurde gesucht. Heute wird gefragt.",
    before: {
      label: "Früher",
      title: "Zehn blaue Links.",
      meta: "Seite 1 von 14",
      /* Four short bullets, written to argue line-for-line against `now.rows`. */
      rows: [
        "Google durchsuchen",
        "Verzeichnisse durchblättern",
        "10 Tabs vergleichen",
        "SEO-optimierte Seiten lesen",
      ],
    },
    now: {
      label: "Heute",
      title: "Eine Antwort.",
      rows: [
        "ChatGPT fragen",
        "Claude fragen",
        "Perplexity fragen",
        "Eine klare Empfehlung erhalten",
      ],
      meta: "Eine Antwort. Keine Seite 2.",
    },
    /* One question, five engines, five different shortlists.
     *
     * The clinic names are INVENTED. Printing three real, named Swiss practices
     * as a live AI ranking would assert an endorsement this page cannot
     * substantiate, so every name here is fictional and the surface carries a
     * visible "Beispielhafte Darstellung" note. See memory/DECISIONS.md.
     *
     * The shortlists deliberately disagree: only ONE name appears in all five
     * answers. That disagreement is the argument for measuring every platform
     * rather than checking ChatGPT once and assuming the rest match. */
    chat: {
      prompt: "Welche Zahnklinik in Bern ist für Implantate empfehlenswert?",
      recommended: "Empfohlen",
      placeholder: "Frage stellen …",
      replay: "Antwort erneut abspielen",
      disclaimer: "Beispielhafte Darstellung",
      sourcesLabel: "Quellen",
      switchLabel: "Antwort einer anderen KI-Plattform anzeigen",
      engines: [
        {
          name: "ChatGPT",
          placeholder: "Frage stellen",
          intro: "Für Implantate werden in Bern vor allem diese Kliniken empfohlen:",
          answers: [
            { name: "Zahnklinik Bellevue", note: "Bern · Implantologie und Ästhetik" },
            { name: "Dental Care Bern", note: "Bern · Implantate und Kieferchirurgie" },
            { name: "Zahnzentrum Aare", note: "Bern · Implantate und Prothetik" },
          ],
          outro: "Weitere Anbieter werden in der Antwort nicht genannt.",
        },
        {
          name: "Google AI",
          placeholder: "Frag Google AI",
          intro: "Diese Kliniken werden für Implantate in Bern am häufigsten genannt:",
          answers: [
            { name: "Dentalzentrum Länggasse", note: "Länggasse · Implantate und Chirurgie" },
            { name: "Zahnklinik Bellevue", note: "Bern · Implantologie und Ästhetik" },
            { name: "Smile Klinik Köniz", note: "Köniz · Implantate und Zahnersatz" },
          ],
          outro: "Die Reihenfolge stützt sich auf öffentlich verfügbare Quellen.",
        },
        {
          name: "Claude",
          placeholder: "Wie kann ich helfen?",
          intro: "Für Implantate kommen in Bern vor allem diese Kliniken in Frage:",
          answers: [
            { name: "Zahnzentrum Aare", note: "Bern · Implantate und Prothetik" },
            { name: "Zahnärzte Breitenrain", note: "Breitenrain · Implantologie" },
            { name: "Zahnklinik Bellevue", note: "Bern · Implantologie und Ästhetik" },
          ],
          outro: "Für eine Entscheidung lohnt sich ein Beratungsgespräch vor Ort.",
        },
        {
          name: "Perplexity",
          placeholder: "Stell eine Frage …",
          intro: "Meistgenannte Kliniken in Bern für Implantate:",
          answers: [
            { name: "Zahnklinik Bellevue", note: "Bern · Implantologie und Ästhetik" },
            { name: "Praxis Kirchenfeld", note: "Kirchenfeld · Allgemeine Zahnmedizin" },
            { name: "Zahnärzte am Bahnhof", note: "Bahnhof Bern · Implantate" },
          ],
          outro: "Zusammengefasst aus mehreren Quellen.",
        },
        {
          name: "Grok",
          placeholder: "Was willst Du wissen?",
          intro: "In Bern werden für Implantate am ehesten diese Adressen genannt:",
          answers: [
            { name: "Dental Care Bern", note: "Bern · Implantate und Kieferchirurgie" },
            { name: "Zahnklinik Bellevue", note: "Bern · Implantologie und Ästhetik" },
            { name: "Dentalzentrum Länggasse", note: "Länggasse · Implantate und Chirurgie" },
          ],
          outro: "Andere Anbieter tauchen in dieser Antwort nicht auf.",
        },
      ],
    },
  },

  what: {
    kicker: "Was ist Leads Engine?",
    /* ONE SENTENCE NOW. This was authored as two, and `splitHeadline` in
       WhatIs.tsx put the first one above the H2 as a small standfirst. The
       client asked for that opening line to go, so it is gone from the copy
       itself rather than suppressed in the component — with a single
       sentence `splitHeadline` returns an empty intro and renders nothing
       above the headline, which is exactly the intended result. */
    title: "Wir zeigen Dir, warum KI andere empfiehlt, und ändern das.",
    body: "Die Analyse läuft auf unserer eigens entwickelten Plattform. Sie liest Dein Geschäft, Deine Leistungen und Deine Märkte aus, ermittelt reale Suchfragen potenzieller Kunden und prüft sie bei ChatGPT, Perplexity, Google AI, Claude und Grok. Danach wissen wir, welche Wettbewerber bevorzugt werden, warum sie sichtbar sind und wo Deine Lücken liegen. Diese Lücken schliessen wir für Dich: Wir setzen die nötigen Massnahmen laufend um und optimieren kontinuierlich weiter. Dafür lesen wir nur, was öffentlich zugänglich ist.",
    lead: "Die Analyse läuft auf unserer eigens entwickelten Plattform und zeigt Dir genau, was die KI über Dich sagt.",
    checksTitle: "Die Plattform zeigt Dir",
    checks: [
      "ob Du in KI-Antworten erscheinst",
      "wie oft Du erscheinst",
      "welche Wettbewerber stattdessen erscheinen",
      "welche Quellen die KI-Systeme nutzen",
      "warum Wettbewerber gewinnen",
      "wo Deine Sichtbarkeitslücken liegen",
    ],
    badges: ["Eigens entwickelt", "ChatGPT · Perplexity · Google AI · Claude · Grok", "Analyse kostenlos"],
  },


  /* The feature strip directly under the hero: six plain statements plus a
     continuously looping row of the platforms that get checked. */
  /* Only the strip survives — the six-item grid was removed. */
  features: {
    marqueeLabel: "Täglich geprüft auf",
  },

  intent: {
    title: "Wir verändern das Ergebnis, während andere Tools nur messen.",
    body: "Die meisten Werkzeuge geben Dir einen Wert und lassen Dich damit allein. Wir zeigen Dir, warum Wettbewerber vor Dir stehen, schliessen die Lücken selbst und messen danach erneut. Acht Punkte, an denen sich das entscheidet.",
    othersLabel: "Andere Tools",
    others: [
      "Erfinden Prompts für die Messung",
      "Nehmen an, statt zu belegen",
      "Zeigen Dir nur einen Score",
      "Messen und hören dann auf",
      "Produzieren massenhaft KI-Content",
      "Ignorieren, welche Quellen die KI nutzt",
      "Kein Blick auf den Wettbewerb",
      "Keine Umsetzung, nur ein Report",
    ],
    usLabel: "Leads Engine",
    us: [
      "Startet bei echten Kundenfragen",
      "Belegt jede Aussage mit einer Quelle",
      "Zeigt, warum Wettbewerber gewinnen",
      "Setzt um, misst erneut, optimiert weiter",
      "Content, der echte Fragen beantwortet",
      "Mappt jede Quelle hinter der Antwort",
      "Vergleicht Dich mit bis zu 10 Anbietern",
      "Umsetzung ist Teil der Leistung",
    ],
  },

  /* The numbers block: Swiss decision-makers decide on data. */
  data: {
    kicker: "Ergebnisse",
    title: "Der Markt, den Leads Engine erschliesst.",
    adoption: {
      title: "KI-Nutzung in der Schweiz",
      meta: "Anteil der Bevölkerung, die KI-Tools nutzt",
      years: ["2022", "2023", "2024", "2025", "2026"],
      values: [11, 24, 38, 47, 54],
      unit: "%",
      note: "3.8 Mio. Menschen, Tendenz steigend",
    },
    split: {
      title: "Wo B2B-Recherche heute startet",
      meta: "Erste Anlaufstelle vor einer Kaufentscheidung",
      items: [
        { label: "KI-Assistent", share: 45 },
        { label: "Google-Suche", share: 31 },
        { label: "Empfehlung", share: 14 },
        { label: "Direkt / Bekannt", share: 10 },
      ],
    },
    engines: {
      title: "Welche Engines Schweizer Nutzer fragen",
      meta: "Anteil der Anfragen je Plattform",
      items: [
        { label: "ChatGPT", share: 62 },
        { label: "Google AI", share: 18 },
        { label: "Perplexity", share: 11 },
        { label: "Claude", share: 6 },
        { label: "Grok", share: 3 },
      ],
    },
    shortlist: {
      title: "Anbieter pro KI-Antwort",
      meta: "Wie viele Namen eine Antwort nennt",
      value: 3.4,
      unit: "im Schnitt",
      note: "Eine KI-Antwort hat keine Seite 2. Wer fehlt, existiert nicht.",
      scale: ["Google: 10 Ergebnisse pro Seite", "KI: 3 bis 5 Anbieter, dann Schluss"],
    },
    /* The growth curve. `note` is not optional garnish: these figures are a
       modelled trajectory, not an audited result, and the section must say so
       on the page. See memory/DECISIONS.md. */
    growth: {
      title: "Was in sechs Monaten möglich ist",
      meta: "Anteil der relevanten Kauffragen, in denen Deine Marke genannt wird",
      months: ["Start", "Monat 1", "Monat 2", "Monat 3", "Monat 4", "Monat 5", "Monat 6"],
      unit: "%",
      series: [
        { label: "Mit Leads Engine", values: [8, 17, 29, 41, 52, 61, 68] },
        { label: "Ohne Massnahmen", values: [8, 8, 9, 9, 10, 10, 11] },
      ],
      deltaLabel: "Unterschied nach 6 Monaten",
      note: "Modellierter Verlauf auf Basis bisheriger Projekte. Kein garantiertes Ergebnis: Deine Ausgangslage bestimmt die Kurve.",
    },
    sources: "Quellen: Gartner B2B Buyer Survey 2026 (n=645) · NielsenIQ Agentic Commerce Tracker 2026 · IGEM-Digimonitor 2025",
  },


  testimonials: {
    kicker: "Stimmen",
    title: "Was Kunden sagen.",
    items: [
      /* PROFESSIONAL REGISTER, SAME SUBSTANCE. These were rewritten at the
         client's request: the previous versions leaned on colloquialisms
         ("da lag der Hund begraben", "stimmten hinten und vorne nicht") that
         read as written rather than said. Each still makes exactly the same
         claim as before — no result was added, removed or inflated in the
         rewrite. */
      {
        quote: "Uns war nicht bekannt, dass ChatGPT bei den relevanten Fragen durchgehend dieselben zwei Wettbewerber nannte. Inzwischen werden wir ebenfalls genannt.",
        name: "Nina Brunner",
        role: "CMO, Fintech · Zürich",
      },
      {
        quote: "Ich war anfangs skeptisch. Der erste Bericht hat dann sehr deutlich gezeigt, wie wir in KI-Antworten tatsächlich dastehen.",
        name: "Marc Wüthrich",
        role: "Head of Growth, SaaS · Basel",
      },
      {
        quote: "Die Preisangaben, die die KI zu uns ausgab, waren nicht korrekt. Innerhalb von vier Wochen war das bereinigt.",
        name: "Sofia Keller",
        role: "Leiterin Marketing, Logistik · Bern",
      },
      {
        quote: "Unsere Google-Kennzahlen waren stabil, die Zahl der Anfragen ging trotzdem zurück. Genau diese Lücke wurde hier sichtbar.",
        name: "Daniel Aeschlimann",
        role: "Geschäftsführer, Fertigung · Winterthur",
      },
    ],
  },

  /* The conversion page at /analyse/. One page, one form, no steps — the
     client was explicit that a visitor must never be asked to click through
     a sequence to reach the thing they already asked for. */
  analyse: {
    metaTitle: "Kostenlose KI-Analyse anfordern – Leads Engine",
    metaDescription:
      "Fordere die kostenlose KI-Sichtbarkeitsanalyse an. Wir prüfen, ob ChatGPT, Perplexity, Google AI, Claude und Grok Dein Unternehmen empfehlen — Ergebnisse in 48 Stunden.",
    kicker: "Kostenlose KI-Analyse",
    title: "Erfahre, ob KI Dich empfiehlt.",
    lead: "Wir prüfen Dein Unternehmen bei ChatGPT, Perplexity, Google AI, Claude und Grok — mit echten Fragen aus Deiner Branche. Du erhältst das Ergebnis innerhalb von 48 Stunden, persönlich und ohne Verpflichtung.",
    /* Three facts under the lead. Short, concrete, no adjectives. */
    assurances: [
      "Ergebnis innerhalb von 48 Stunden",
      "Kostenlos und unverbindlich",
      "Keine Kreditkarte, kein Abo",
    ],
    formTitle: "Deine Angaben",
    formLead: "Fünf Felder. Mehr brauchen wir nicht, um die Analyse zu starten.",
    fields: {
      name: "Vor- und Nachname",
      namePlaceholder: "Anna Muster",
      email: "E-Mail-Adresse",
      emailPlaceholder: "anna@firma.ch",
      phone: "Telefon",
      phonePlaceholder: "+41 79 000 00 00",
      role: "Deine Rolle im Unternehmen",
      rolePlaceholder: "Geschäftsführung, Marketing …",
      website: "Website",
      websitePlaceholder: "firma.ch",
    },
    /* The consent line is split so the policy link is a real link inside the
       sentence rather than a second line under it. */
    privacyBefore: "Ich habe die",
    privacyLink: "Datenschutzerklärung",
    privacyAfter: "gelesen und bin mit der Verarbeitung meiner Angaben zur Beantwortung dieser Anfrage einverstanden.",
    submit: "Kostenlose Analyse anfordern",
    submitting: "Wird gesendet …",
    required: "Pflichtfeld",
    errors: {
      name: "Bitte gib Deinen Namen an.",
      email: "Bitte gib Deine E-Mail-Adresse an.",
      emailInvalid: "Diese E-Mail-Adresse sieht nicht gültig aus.",
      phone: "Bitte gib Deine Telefonnummer an.",
      role: "Bitte gib Deine Rolle an.",
      website: "Bitte gib Deine Website an.",
      consent: "Bitte bestätige die Datenschutzerklärung.",
      failed: "Das hat leider nicht geklappt. Bitte versuche es erneut oder schreib uns direkt an info@leadsengine.ch.",
    },
    successTitle: "Danke — wir haben Deine Anfrage.",
    successBody: "Wir starten die Analyse und melden uns innerhalb von 48 Stunden mit dem Ergebnis. Bei Rückfragen erreichst Du uns jederzeit unter info@leadsengine.ch.",
    successBack: "Zurück zur Startseite",
    /* What happens after the form. Removes the main reason people hesitate:
       not knowing what they have just started. */
    stepsTitle: "Was danach passiert",
    steps: [
      {
        title: "Wir sammeln die echten Fragen",
        body: "Aus Deiner Website und Deinem Markt leiten wir die Fragen ab, die Deine Kunden vor einem Kauf tatsächlich stellen.",
      },
      {
        title: "Wir stellen sie fünf KI-Systemen",
        body: "Jede Frage geht an ChatGPT, Perplexity, Google AI, Claude und Grok. Wir halten fest, wer genannt wird und warum.",
      },
      {
        title: "Du bekommst das Ergebnis",
        body: "Innerhalb von 48 Stunden, mit den Quellen, auf die sich die Systeme stützen, und den konkreten Lücken.",
      },
    ],
    trustTitle: "Was Kunden sagen",
  },

  about: {
    kicker: "Über uns",
    title: "Führende Unternehmen vertrauen uns.",
    intro:
      "Leads Engine ist ein Produkt von Future Media: entwickelt in Bern und Zürich, aufgebaut auf der Arbeit mit diesen Marken.",
    pillars: [
      {
        title: "Schweizer Entwicklung",
        body: "Plattform, Datenhaltung und Support liegen in Bern und Zürich. Kurze Entscheidungswege, ein fester Ansprechpartner.",
      },
      {
        title: "Umsetzung inklusive",
        body: "Die Analyse ist der Anfang, nicht das Ergebnis. Fehlende Inhalte werden erstellt, strukturelle Schwachstellen behoben.",
      },
      {
        title: "Marketing-DNA",
        body: "Hinter der Plattform steht eine Agentur, die Sichtbarkeit seit sieben Jahren in messbare Resultate übersetzt.",
      },
    ],
    closing: "Jetzt bringen wir diese Erfahrung dorthin, wo Deine Kunden morgen suchen: in die KI-Antwort.",
    teamKicker: "Das Team",
    /* Per-language role overrides, keyed by first name. Names omitted here
       fall back to the English `role` in src/constants/team.ts. */
    roles: {
      Elias: "CEO & Founder",
      Livia: "Marketing Manager",
      Alex: "Wachstum & Vertrieb",
      Mohie: "CTO & AI & Software Engineer",
      Lara: "Kundenbetreuung",
      Daniel: "AI & Software Engineer",
      Mahboob: "Data Security Advisor",
    } as Record<string, string>,

    /* The standalone "Über uns" page (scripts/about-page.mjs). Longer-form
       than anything on the one-page site, written in Leads Engine's own
       voice and its own facts — nothing here is carried over from any
       competitor's page. Structure only was informed by what a background
       page like this usually needs to answer for a first-time reader. */
    page: {
      title: "Über Future Media und Leads Engine",
      metaDescription:
        "Leads Engine ist ein Produkt der Future Media GmbH aus Bern und Zürich. Wer wir sind, warum es Leads Engine gibt und wie wir arbeiten.",
      heroKicker: "Über uns",
      heroTitle: "Wer hinter Leads Engine steht.",
      heroLead:
        "Leads Engine ist eine Entwicklung der Future Media GmbH, einer Marketing-Agentur mit Standorten in Bern und Zürich. Seit sieben Jahren verantworten wir die Sichtbarkeit Schweizer Marken. Heute auch dort, wo Kaufentscheidungen zunehmend beginnen: in der Antwort einer KI.",
      sections: [
        {
          title: "Wer wir sind",
          body: [
            "Future Media ist eine Marketing-Agentur mit Standorten in Bern und Zürich. Unser Kerngeschäft ist seit sieben Jahren unverändert: dafür zu sorgen, dass Schweizer Unternehmen gefunden werden. Über Suchmaschinen, bezahlte Kanäle und Inhalte.",
            "Zu unseren Mandaten zählen Victorinox, Transsicura, Arte Cucina und die Universität Bern, ebenso wie zahlreiche mittelständische Betriebe, deren Markt in der eigenen Region liegt. Für beide gilt derselbe Massstab: messbare Resultate statt Reichweite ohne Wirkung.",
            "Aus der gleichzeitigen Betreuung von rund siebzig Mandaten entsteht ein Vorteil, den einzelne Projekte nicht bieten. Veränderungen im Suchverhalten werden dort sichtbar, lange bevor sie in Marktstudien erscheinen.",
          ],
        },
        {
          title: "Warum es Leads Engine gibt",
          body: [
            "Ab 2024 häuften sich in Kundengesprächen dieselben Beobachtungen: Die Kennzahlen blieben stabil, die Zahl qualifizierter Anfragen ging dennoch zurück. Rankings unverändert, Besucherzahlen im Rahmen, Abschlüsse rückläufig.",
            "Eine erste Überprüfung bestätigte den Verdacht. Auf die Frage, welche Anbieter einer Branche zu empfehlen seien, nannte eine KI drei Unternehmen. Unser Mandant war nicht darunter, trotz Position zwei in der organischen Google-Suche.",
            "Für diesen Bereich existierte kein Werkzeug. Etablierte SEO-Software misst Rankings, nicht die Antworten generativer Systeme. Wir haben die fehlende Analyse zunächst für den eigenen Mandantenstamm entwickelt. Daraus ist Leads Engine entstanden.",
          ],
        },
        {
          title: "Wie wir arbeiten",
          body: [
            "Unsere Leistung endet nicht mit dem Bericht. Inhalte, die in den Antworten fehlen, werden von uns erstellt, strukturelle Schwachstellen beheben wir selbst. Die Umsetzung ist Bestandteil des Mandats und kein separates Angebot.",
            "Jede Aussage ist belegt. Wir weisen die Quelle aus, auf die sich ein System stützt: die Seite, das Verzeichnis oder die Bewertung. So bleibt jede Empfehlung nachvollziehbar und überprüfbar.",
            "Die Messung läuft nach dem ersten Bericht weiter. Sichtbarkeit in generativen Systemen ist kein einmalig hergestellter Zustand, sondern ein Wert, der laufend kontrolliert werden muss.",
          ],
        },
        {
          title: "Wo wir sitzen",
          body: [
            "Bern und Zürich. Entwicklung, Betrieb und Hosting erfolgen vollständig in der Schweiz. Jedes Mandat hat einen festen Ansprechpartner in der eigenen Zeitzone, und Kundendaten verlassen das Land nicht.",
          ],
        },
      ],
      closing: {
        title: "Fragen zu Future Media, unseren Daten oder einer Zusammenarbeit?",
        body: "Wir antworten persönlich, in der Regel noch am selben Arbeitstag.",
        button: "Kontakt aufnehmen",
      },
      /* The honesty block, as a short lead plus compact labelled lines rather
         than three long paragraphs. A reader scans this section for what we
         will NOT do; a run of prose is the wrong shape for that, and it was
         also the longest thing on the page. */
      commitments: {
        title: "Was wir bewusst nicht versprechen",
        lead: "Zur Seriosität gehört, die Grenzen der eigenen Leistung zu benennen. Drei Punkte, die wir bewusst nicht zusagen:",
        items: [
          {
            label: "Keine garantierte Platzierung",
            text: "Eine Platzierung in ChatGPT, Claude oder Gemini lässt sich nicht garantieren. Wer eine solche Zusage macht, verspricht ein Ergebnis, über das er keine Kontrolle hat.",
          },
          {
            label: "Keine gekaufte Sichtbarkeit",
            text: "Ein besserer Score beruht ausschliesslich auf echten, überprüfbaren Signalen. Bezahlte Platzierungen oder PR-Artikel sind kein Bestandteil unserer Methodik.",
          },
          {
            label: "Keine garantierten Wachstumszahlen",
            text: "Die Kennzahlen auf dieser Website sind Modellwerte aus abgeschlossenen Projekten. Ausgangslage, Branche und Wettbewerb bestimmen das tatsächliche Ergebnis.",
          },
        ],
      },

      /* The identity card directly under the hero: who the legal entity is,
         where it sits, and three figures. EVERY figure is derived at render
         time from data that already exists (SITE.locations, TEAM, the
         platform list) — none of them is typed in here, so none can go stale
         or overstate anything. */
      factsKicker: "Das Unternehmen hinter Leads Engine",
      factsLocations: "Standorte",
      factsTeam: "Team",
      factsSystems: "Geprüfte KI-Systeme",
      factsSiteLabel: "Zur Agentur-Website",

      valuesKicker: "Haltung",
      valuesTitle: "Wofür wir stehen",

      backLabel: "Zurück zur Startseite",
    },
  },



  faq: {
    kicker: "FAQ",
    title: "Häufige Fragen.",
    items: [
      {
        q: "Was genau analysiert Leads Engine?",
        a: "Leads Engine liest Deine Website aus: Angebot, Standorte, Zielgruppe, Stärken. Daraus ermittelt sie reale Fragen, die potenzielle Kunden vor dem Kauf stellen. Diese Fragen werden bei ChatGPT, Perplexity, Google AI, Claude und Grok geprüft. Du siehst, ob und wie oft Du genannt wirst, welche Wettbewerber stattdessen empfohlen werden, welche Quellen dahinterstehen und wo Deine Lücken liegen.",
      },
      {
        q: "Welche KI-Plattformen werden analysiert?",
        a: "ChatGPT, Perplexity, Google AI, Claude und Grok. Jede Frage geht an jede Plattform. So siehst Du nicht nur, ob Du irgendwo erscheinst, sondern wo genau und wo Wettbewerber Dich überholen.",
      },
      {
        q: "Wie lange dauert die Analyse?",
        a: "Die erste KI-Analyse Deiner Website ist innerhalb von 48 Stunden fertig. Du nennst uns nur Deine Website-Adresse. Der Rest läuft automatisch auf unserer Plattform, ohne Aufwand für Dich.",
      },
      {
        q: "Was passiert nach der kostenlosen Analyse?",
        a: "Wir besprechen Deine Resultate in einem kurzen Gespräch: 15 Minuten, kein Pitch. Du erfährst die drei grössten Hebel für mehr KI-Sichtbarkeit und wir sagen Dir ehrlich, ob sich Leads Engine für Dich lohnt. Erst danach entscheidest Du, ob wir die Umsetzung übernehmen sollen.",
      },
      {
        q: "Muss ich Leads Engine Zugriff auf meine Website geben?",
        a: "Nein. Wir lesen nur, was öffentlich zugänglich ist, genauso wie es auch die KI-Modelle tun. Kein Login, kein Passwort, keine Installation. Für die Umsetzung von Massnahmen auf Deiner Website stimmen wir den Zugang später individuell mit Dir ab.",
      },
      {
        q: "Welche Daten werden verwendet?",
        a: "Öffentliche Inhalte Deiner Website, reale Suchnachfrage aus Google Autocomplete und People Also Ask sowie die Antworten der KI-Plattformen. Personendaten werden dafür nicht erhoben. Plattform, Daten und Support kommen aus Bern und Zürich. Deine Daten bleiben in der Schweiz.",
      },
      {
        q: "Für welche Unternehmen eignet sich Leads Engine?",
        a: "Für Schweizer Unternehmen, deren Kunden vor dem Kauf recherchieren, vom lokalen Dienstleister bis zum B2B-Anbieter mit erklärungsbedürftigen Leistungen. Besonders wertvoll ist Leads Engine für CEO, Marketing und Vertrieb, die wissen wollen, ob KI sie empfiehlt oder die Konkurrenz.",
      },
      {
        q: "Was unterscheidet Leads Engine von klassischem SEO?",
        a: "SEO optimiert Rankings auf einer Google-Ergebnisseite. Leads Engine misst und verbessert, ob eine KI Dich in ihrer Antwort nennt, als Quelle nutzt und gegenüber dem Wettbewerb empfiehlt, gemessen als Mention, Zitation und Share of Voice. Eine KI-Antwort hat keine Seite 2; wer dort fehlt, ist für diese Kunden unsichtbar.",
      },
    ],
  },

  finalCta: {
    kicker: "Der nächste Schritt",
    title: "Wirst Du von KI empfohlen, oder Deine Konkurrenz?",
    body: "Finde heraus, wie ChatGPT & Co. Dein Unternehmen heute sehen und wo Deine grössten Chancen liegen.",
    button: "Kostenlose KI-Analyse starten",
  },

  footer: {
    tagline: "Damit KI Dich Deiner Zielgruppe empfiehlt.",
    madeIn: "Entwickelt in Bern & Zürich, Schweiz.",
    developedBy: "Entwickelt vom Team der Future Media GmbH.",
    byline: "Leads Engine ist ein Produkt der Future Media GmbH.",
    columns: {
      product: "Produkt",
      company: "Unternehmen",
      legal: "Rechtliches",
    },
    links: {
      how: "So funktioniert's",
      benefits: "Vorteile",
      results: "Ergebnisse",
      data: "Marktdaten",
      faq: "FAQ",
      contact: "Kontakt",
      imprint: "Impressum",
      privacy: "Datenschutz",
      terms: "AGB",
    },
    contactLabels: { email: "Mail", phone: "Tel.", web: "Web", locations: "Standorte" },
    rights: "Alle Rechte vorbehalten.",
    langLabel: "Sprache",
    contact: {
      heading: "Kontakt",
      lead: "Schreib uns. Wir melden uns in der Regel am selben Arbeitstag.",
      emailLabel: "E-Mail",
      phoneLabel: "Telefon",
      hoursLabel: "Erreichbarkeit",
      hours: "Mo–Fr, 08:00–18:00",
      addressLabel: "Adresse",
      address: "Weltpoststrasse 5\n3015 Bern",
    },
    form: {
      heading: "Nachricht senden",
      name: "Dein Name",
      namePlaceholder: "Vor- und Nachname",
      email: "E-Mail-Adresse",
      emailPlaceholder: "name@firma.ch",
      phone: "Telefon",
      phonePlaceholder: "+41 79 000 00 00",
      message: "Deine Nachricht",
      messagePlaceholder: "Worum geht es?",
      submit: "Einreichen",
      subject: "Anfrage über leadsengine.ch",
      sent: "Mail-Programm geöffnet.",
      required: "Pflichtfeld",
      privacy:
        "Deine Angaben werden ausschliesslich zur Beantwortung Deiner Anfrage verwendet.",
      errors: {
        name: "Bitte Namen angeben.",
        email: "Bitte E-Mail angeben.",
        emailInvalid: "Diese E-Mail-Adresse sieht nicht gültig aus.",
        phone: "Bitte Telefonnummer angeben.",
        message: "Bitte Nachricht angeben.",
      },
    },
  },

  trusted: {
    label: "Unternehmen, die uns vertrauen",
    clientLogo: "Kundenlogo",
    byline: "Leads Engine ist ein Produkt von Future Media.",
  },


  /* The explainer video. `title`/`lead` frame it; the rest are control
     labels, which must be translated because they are the accessible names
     of real buttons, not decoration. */
  video: {
    kicker: "In 2 Minuten erklärt",
    title: "Wie Leads Engine funktioniert.",
    lead: "Was passiert, wenn ein Kunde nicht mehr googelt, sondern fragt.",
    play: "Video abspielen",
    pause: "Pause",
    mute: "Ton aus",
    unmute: "Ton an",
    fullscreen: "Vollbild",
    exitFullscreen: "Vollbild beenden",
    seek: "Position im Video",
    quality: "Qualität",
    replay: "Erneut abspielen",
    unsupported: "Dein Browser kann dieses Video nicht abspielen.",
  },

  legal: {
    imprint: {
      title: "Impressum",
      body: "Future Media GmbH\nWeltpoststrasse 5, 3015 Bern\nHardstrasse 201, 8005 Zürich\n\nE-Mail: info@future-media.ch\nTelefon: 078 799 35 17\nWeb: future-media.ch\n\nLeads Engine ist ein Produkt der Future Media GmbH.\nVerantwortlich für den Inhalt: die Geschäftsleitung der Future Media GmbH.\n\nAlle Inhalte dieser Website dienen der allgemeinen Information. Wir prüfen sie sorgfältig, übernehmen jedoch keine Haftung für Vollständigkeit oder Richtigkeit und ebenso wenig für die Inhalte externer Links, die in der Verantwortung ihrer Betreiber bleiben.",
    },
    privacy: {
      title: "Datenschutzerklärung",
      body: "Die Future Media GmbH, Bern und Zürich, bearbeitet Personendaten im Einklang mit dem revidierten Schweizer Datenschutzgesetz (revDSG) und, soweit anwendbar, der EU-DSGVO.\n\nWas wir erheben: Die Website-Analytics laufen standardmässig cookiefrei und bilden keine Personenprofile. Für die KI-Analyse lesen wir ausschliesslich öffentlich zugängliche Website-Inhalte; Personendaten werden dafür nicht erhoben. Wenn Du uns kontaktierst oder eine Analyse anforderst, bearbeiten wir die von Dir angegebenen Daten (Name, E-Mail, Unternehmen, Website) ausschliesslich zur Bearbeitung Deiner Anfrage.\n\nHosting & Übermittlung: Die Daten werden auf Schweizer und EU-Infrastruktur bearbeitet. Wir verkaufen keine Personendaten und geben sie nur an jene Auftragsbearbeiter weiter, die für den Betrieb dieser Website nötig sind (Analytics, Terminbuchung), unter gleichwertigem Schutz.\n\nDeine Rechte: Du kannst jederzeit Auskunft, Berichtigung oder Löschung Deiner Personendaten verlangen. Kontakt: info@future-media.ch.",
    },
    terms: {
      title: "Allgemeine Geschäftsbedingungen",
      body: "Diese Bedingungen regeln die Nutzung dieser Website sowie die Leads-Engine-Leistungen der Future Media GmbH, Bern und Zürich.\n\nLeistungen: Die kostenlose KI-Analyse und die Report-Besprechung sind unverbindlich. Monitoring, Reporting, Content und Optimierung werden gemäss der jeweiligen schriftlichen Vereinbarung erbracht; Umfang, Dauer und Vergütung werden im Einzelauftrag festgelegt.\n\nNutzung dieser Website: Die Inhalte werden ohne Gewähr bereitgestellt. Vervielfältigung oder Weiterverwendung von Inhalten bedarf der vorgängigen schriftlichen Zustimmung. Wir können Website-Inhalte jederzeit anpassen oder einstellen.\n\nHaftung: Soweit gesetzlich zulässig, ist die Haftung für indirekte Schäden und Folgeschäden ausgeschlossen. Zwingende gesetzliche Haftung bleibt vorbehalten.\n\nAnwendbares Recht: Schweizer Recht. Gerichtsstand ist Bern, Schweiz.",
    },
    close: "Schliessen",
  },
};

export type Dict = typeof de;
