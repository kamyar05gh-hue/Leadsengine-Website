import type { Dict } from "./translations.de";

/* English — a faithful translation of the German primary. Same register
   (direct "you"), same facts, same structure. */
export const en: Dict = {
  meta: { lang: "en", htmlLang: "en" },

  nav: {
    how: "How it works",
    results: "Results",
    voices: "Voices",
    faq: "FAQ",
    about: "About us",
    menu: "Open menu",
    close: "Close menu",
  },

  cta: {
    primary: "Start your free AI analysis",
    secondary: "How it works",
    short: "Free analysis",
  },

  hero: {
    eyebrow: "Switzerland's first company for AI visibility",
    h1: ["Your customers", "stopped googling."],
    h1Accent: "They ask AI.",
    sub: "We make your company visible in ChatGPT & Co.",
    engineLabel:
      "Leads Engine: company and market data go in, AI platforms are analysed, measurable visibility comes out.",
    platforms: ["ChatGPT", "Google AI", "Claude", "Perplexity", "Grok"],
    scrollHint: "Keep reading",
    trustLine: "7 years of experience in lead generation",
  },



  problem: {
    kicker: "What changed",
    title: "People used to search. Now they ask.",
    before: {
      label: "Before",
      title: "Ten blue links.",
      meta: "Page 1 of 14",
      rows: [
        "Searching Google",
        "Browsing directories",
        "Comparing 10 tabs",
        "Reading SEO-optimised pages",
      ],
    },
    now: {
      label: "Now",
      title: "One answer.",
      rows: [
        "Asking ChatGPT",
        "Asking Claude",
        "Asking Perplexity",
        "Getting a clear recommendation",
      ],
      meta: "One answer. No page 2.",
    },
    /* Clinic names are INVENTED — see the note on the German dictionary. */
    chat: {
      prompt: "Which dental clinic in Bern would you recommend for implants?",
      recommended: "Recommended",
      placeholder: "Ask anything …",
      replay: "Replay the answer",
      disclaimer: "Illustrative example",
      sourcesLabel: "Sources",
      switchLabel: "Show the answer from another AI platform",
      engines: [
        {
          name: "ChatGPT",
          placeholder: "Message ChatGPT",
          intro: "For implants in Bern, these clinics are most often recommended:",
          answers: [
            { name: "Zahnklinik Bellevue", note: "Bern · Implantology and aesthetics" },
            { name: "Dental Care Bern", note: "Bern · Implants and oral surgery" },
            { name: "Zahnzentrum Aare", note: "Bern · Implants and prosthetics" },
          ],
          outro: "No other providers are named in the answer.",
        },
        {
          name: "Google AI",
          placeholder: "Ask Google AI",
          intro: "These clinics come up most frequently for implants in Bern:",
          answers: [
            { name: "Dentalzentrum Länggasse", note: "Länggasse · Implants and surgery" },
            { name: "Zahnklinik Bellevue", note: "Bern · Implantology and aesthetics" },
            { name: "Smile Klinik Köniz", note: "Köniz · Implants and dentures" },
          ],
          outro: "The ordering draws on publicly available sources.",
        },
        {
          name: "Claude",
          placeholder: "How can I help you today?",
          intro: "For implants in Bern, these clinics are worth considering:",
          answers: [
            { name: "Zahnzentrum Aare", note: "Bern · Implants and prosthetics" },
            { name: "Zahnärzte Breitenrain", note: "Breitenrain · Implantology" },
            { name: "Zahnklinik Bellevue", note: "Bern · Implantology and aesthetics" },
          ],
          outro: "A consultation on site is worth having before deciding.",
        },
        {
          name: "Perplexity",
          placeholder: "Ask anything…",
          intro: "Most-cited clinics in Bern for implants:",
          answers: [
            { name: "Zahnklinik Bellevue", note: "Bern · Implantology and aesthetics" },
            { name: "Praxis Kirchenfeld", note: "Kirchenfeld · General dentistry" },
            { name: "Zahnärzte am Bahnhof", note: "Bahnhof Bern · Implants" },
          ],
          outro: "Synthesised from several sources.",
        },
        {
          name: "Grok",
          placeholder: "What do you want to know?",
          intro: "In Bern these are the addresses most likely to come up for implants:",
          answers: [
            { name: "Dental Care Bern", note: "Bern · Implants and oral surgery" },
            { name: "Zahnklinik Bellevue", note: "Bern · Implantology and aesthetics" },
            { name: "Dentalzentrum Länggasse", note: "Länggasse · Implants and surgery" },
          ],
          outro: "Other providers do not appear in this answer.",
        },
      ],
    },
  },

  what: {
    kicker: "What is Leads Engine?",
    title: "We show you why AI recommends others, and change that.",
    body: "The analysis runs on our own purpose-built platform. It reads your business, your services and your markets, identifies the real questions potential customers ask, and tests them on ChatGPT, Perplexity, Google AI, Claude and Grok. Then we know which competitors are preferred, why they are visible, and where your gaps are. We close those gaps for you: we implement the necessary measures continuously and keep optimising. For this we only read what is publicly accessible.",
    lead: "The analysis runs on our own purpose-built platform and shows you exactly what AI says about you.",
    checksTitle: "The platform shows you",
    checks: [
      "whether you appear in AI answers",
      "how often you appear",
      "which competitors appear instead",
      "which sources the AI systems use",
      "why competitors are winning",
      "where your visibility gaps are",
    ],
    badges: ["Built in-house", "ChatGPT · Perplexity · Google AI · Claude · Grok", "Free analysis"],
  },


  /* Only the strip survives — the six-item grid was removed. */
  features: {
    marqueeLabel: "Checked daily on",
  },

  intent: {
    kicker: "Side by side",
    title: "We change the outcome, while other tools just measure.",
    body: "Most tools hand you a score and leave you with it. We show you why competitors rank ahead of you, close the gaps ourselves, and measure again afterwards. Eight points where that difference shows.",
    othersLabel: "Other tools",
    others: [
      "Invent prompts for the measurement",
      "Assume instead of proving",
      "Show you only a score",
      "Measure, then stop",
      "Mass-produce AI content",
      "Ignore which sources the AI uses",
      "No view of the competition",
      "No implementation, just a report",
    ],
    usLabel: "Leads Engine",
    us: [
      "Starts from real customer questions",
      "Backs every claim with a source",
      "Shows why competitors win",
      "Implements, re-measures, keeps optimising",
      "Content that answers real questions",
      "Maps every source behind the answer",
      "Compares you against up to 10 providers",
      "Implementation is part of the service",
    ],
  },

  data: {
    kicker: "Results",
    title: "The market Leads Engine unlocks.",
    sub: "How Swiss demand is shifting into AI answers.",
    adoption: {
      title: "AI adoption in Switzerland",
      meta: "Share of the population using AI tools",
      years: ["2022", "2023", "2024", "2025", "2026"],
      values: [11, 24, 38, 47, 54],
      unit: "%",
      note: "3.8M people, and rising",
    },
    split: {
      title: "Where B2B research starts today",
      meta: "First stop before a purchase decision",
      items: [
        { label: "AI assistant", share: 45 },
        { label: "Google search", share: 31 },
        { label: "Referral", share: 14 },
        { label: "Direct / known", share: 10 },
      ],
    },
    engines: {
      title: "Which engines Swiss users ask",
      meta: "Share of queries per platform",
      items: [
        { label: "ChatGPT", share: 62 },
        { label: "Google AI", share: 18 },
        { label: "Perplexity", share: 11 },
        { label: "Claude", share: 6 },
        { label: "Grok", share: 3 },
      ],
    },
    shortlist: {
      title: "Providers per AI answer",
      meta: "How many names one answer gives",
      value: 3.4,
      unit: "on average",
      note: "An AI answer has no page 2. Whoever is missing does not exist.",
      scale: ["Google: 10 results per page", "AI: 3 to 5 providers, then it stops"],
    },
    growth: {
      title: "What six months can look like",
      meta: "Share of relevant buying questions in which your brand is named",
      months: ["Start", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
      unit: "%",
      series: [
        { label: "With Leads Engine", values: [8, 17, 29, 41, 52, 61, 68] },
        { label: "Without action", values: [8, 8, 9, 9, 10, 10, 11] },
      ],
      deltaLabel: "Difference after 6 months",
      note: "A modelled trajectory based on previous projects. Not a guaranteed result: your starting point sets the curve.",
    },
    sources: "Sources: Gartner B2B Buyer Survey 2026 (n=645) · NielsenIQ Agentic Commerce Tracker 2026 · IGEM-Digimonitor 2025",
  },




  testimonials: {
    kicker: "Voices",
    title: "What clients say.",
    items: [
      {
        quote: "We had no idea ChatGPT kept naming the same two competitors. Now we're in there too.",
        name: "Nina Brunner",
        role: "CMO, fintech · Zurich",
      },
      {
        quote: "I was sceptical, to be honest. The first report was a bit of a cold shower.",
        name: "Marc Wüthrich",
        role: "Head of Growth, SaaS · Basel",
      },
      {
        quote: "The prices the AI was quoting for us were nowhere near right. Sorted within four weeks.",
        name: "Sofia Keller",
        role: "Head of Marketing, logistics · Bern",
      },
      {
        quote: "Our Google numbers looked fine and the phone still wasn't ringing. So that's where it was going.",
        name: "Daniel Aeschlimann",
        role: "Managing Director, manufacturing · Winterthur",
      },
    ],
  },

  about: {
    kicker: "About us",
    title: "Leading companies trust us.",
    intro:
      "Leads Engine is a product of Future Media: developed in Bern and Zurich, built on the work with these brands.",
    pillars: [
      {
        title: "Swiss development",
        body: "Platform, data and support are based in Bern and Zurich. Short decision paths, one named contact.",
      },
      {
        title: "Implementation included",
        body: "The analysis is the beginning, not the deliverable. Missing content is produced, structural weaknesses are corrected.",
      },
      {
        title: "Marketing DNA",
        body: "Behind the platform stands an agency that has translated visibility into measurable results for seven years.",
      },
    ],
    closing: "Now we bring that experience to where your customers will search tomorrow: the AI answer.",
    teamKicker: "The team",
    teamTitle: "The people behind Leads Engine",
    teamLead:
      "Leads Engine is built in collaboration with Future Media, a marketing agency in Bern and Zurich. The same team that has worked with Swiss brands for seven years builds and runs the platform.",
    roles: {
      Elias: "CEO & Founder",
      Livia: "Marketing Manager",
      Alex: "Growth & Sales",
      Mohie: "CTO & AI/Software Engineer",
      Lara: "Customer Support",
      Daniel: "AI & Software Engineer",
      Mahboob: "Data Security Advisor",
    },

    page: {
      title: "About Future Media and Leads Engine",
      metaDescription:
        "Leads Engine is a product of Future Media GmbH in Bern and Zurich. Who we are, why Leads Engine exists, and how we work.",
      heroKicker: "About us",
      heroTitle: "Who is behind Leads Engine.",
      heroLead:
        "Leads Engine is a development of Future Media GmbH, a marketing agency with offices in Bern and Zurich. For seven years we have been responsible for the visibility of Swiss brands. Today that includes the place where purchase decisions increasingly begin: the answer given by an AI.",
      sections: [
        {
          title: "Who we are",
          body: [
            "Future Media is a marketing agency with offices in Bern and Zurich. Our core business has been unchanged for seven years: making sure Swiss companies get found, through search engines, paid channels and content.",
            "Our clients include Victorinox, Transsicura, Arte Cucina and the University of Bern, alongside numerous mid-sized firms whose market lies in their own region. The same standard applies to both: measurable results rather than reach without effect.",
            "Handling roughly seventy mandates at once produces an advantage that individual projects cannot offer. Shifts in search behaviour become visible there long before they appear in market studies.",
          ],
        },
        {
          title: "Why Leads Engine exists",
          body: [
            "From 2024 the same observations accumulated in client meetings: the metrics held steady, yet the number of qualified enquiries fell. Rankings unchanged, visitor numbers within range, closings down.",
            "An initial review confirmed the suspicion. Asked which providers in a given sector it would recommend, an AI named three companies. Our client was not among them, despite holding position two in organic Google search.",
            "No tool existed for this. Established SEO software measures rankings, not the answers of generative systems. We developed the missing analysis for our own client base first. Leads Engine grew out of it.",
          ],
        },
        {
          title: "How we work",
          body: [
            "Our work does not end with the report. Content missing from the answers is produced by us, and structural weaknesses are corrected by us. Implementation is part of the mandate, not a separate offer.",
            "Every statement is evidenced. We identify the source a system relies on: the page, the directory or the review. Every recommendation therefore remains traceable and verifiable.",
            "Measurement continues after the first report. Visibility in generative systems is not a state established once, but a value that has to be monitored continuously.",
          ],
        },
        {
          title: "Where we're based",
          body: [
            "Bern and Zurich. Development, operation and hosting take place entirely in Switzerland. Every mandate has one named contact in its own time zone, and client data does not leave the country.",
          ],
        },
      ],
      closing: {
        title: "Questions about Future Media, our data, or working together?",
        body: "We answer personally, as a rule on the same working day.",
        button: "Get in touch",
      },
      /* See the note on this block in translations.de.ts. */
      commitments: {
        title: "What we deliberately don't promise",
        lead: "Professional practice includes naming the limits of what we deliver. Three things we deliberately do not promise:",
        items: [
          {
            label: "No guaranteed placement",
            text: "A placement in ChatGPT, Claude or Gemini cannot be guaranteed. Anyone giving such an assurance is promising an outcome they do not control.",
          },
          {
            label: "No bought visibility",
            text: "A better score rests exclusively on genuine, verifiable signals. Paid placements and PR articles are not part of our methodology.",
          },
          {
            label: "No guaranteed growth figures",
            text: "The figures on this site are modelled on completed projects. Starting position, sector and competition determine the actual result.",
          },
        ],
      },

      /* See the note on this block in translations.de.ts — every figure is
         derived at render time, never typed in. */
      factsKicker: "The company behind Leads Engine",
      factsLocations: "Locations",
      factsTeam: "Team",
      factsSystems: "AI systems checked",
      factsSiteLabel: "Visit the agency site",

      valuesKicker: "What drives us",
      valuesTitle: "What we stand for",

      backLabel: "Back to home",
    },
  },



  faq: {
    kicker: "FAQ",
    title: "Frequently asked questions.",
    items: [
      {
        q: "What exactly does Leads Engine analyse?",
        a: "Leads Engine reads your website: offering, locations, target audience, strengths. From that it derives the real questions potential customers ask before they buy. Those questions are tested on ChatGPT, Perplexity, Google AI, Claude and Grok. You see whether and how often you are named, which competitors are recommended instead, which sources are behind them, and where your gaps are.",
      },
      {
        q: "Which AI platforms are analysed?",
        a: "ChatGPT, Perplexity, Google AI, Claude and Grok. Every question goes to every platform. So you see not only whether you appear somewhere, but exactly where, and where competitors are overtaking you.",
      },
      {
        q: "How long does the analysis take?",
        a: "The first AI analysis of your website is ready within 48 hours. You only give us your website address. The rest runs automatically on our platform, with no effort on your side.",
      },
      {
        q: "What happens after the free analysis?",
        a: "We discuss your results in a short call: 15 minutes, no pitch. You learn the three biggest levers for more AI visibility and we tell you honestly whether Leads Engine is worth it for you. Only then do you decide whether we should take over the implementation.",
      },
      {
        q: "Do I have to give Leads Engine access to my website?",
        a: "No. We only read what is publicly accessible, just like the AI models do. No login, no password, no installation. For implementing measures on your website, we agree access with you individually later on.",
      },
      {
        q: "Which data is used?",
        a: "Public content from your website, real search demand from Google Autocomplete and People Also Ask, and the answers of the AI platforms. No personal data is collected for this. Platform, data and support come from Bern and Zurich. Your data stays in Switzerland.",
      },
      {
        q: "Which companies is Leads Engine suitable for?",
        a: "For Swiss companies whose customers research before they buy, from local service providers to B2B providers with complex services. Leads Engine is especially valuable for CEOs, marketing and sales who want to know whether AI recommends them or the competition.",
      },
      {
        q: "What distinguishes Leads Engine from classic SEO?",
        a: "SEO optimises rankings on a Google results page. Leads Engine measures and improves whether an AI names you in its answer, uses you as a source and recommends you over competitors, measured as Mention, Citation and Share of Voice. An AI answer has no page 2; whoever is missing there is invisible to these customers.",
      },
    ],
  },

  finalCta: {
    kicker: "The next step",
    title: "Does AI recommend you, or your competition?",
    body: "Find out how ChatGPT & Co. see your company today and where your biggest opportunities lie.",
    button: "Start your free AI analysis",
  },

  footer: {
    tagline: "So that AI recommends you to your audience.",
    madeIn: "Developed in Bern & Zurich, Switzerland.",
    developedBy: "Built by the Future Media GmbH team.",
    byline: "Leads Engine is a product of Future Media GmbH.",
    columns: {
      product: "Product",
      company: "Company",
      legal: "Legal",
    },
    links: {
      how: "How it works",
      benefits: "Benefits",
      results: "Results",
      data: "Market data",
      faq: "FAQ",
      contact: "Contact",
      imprint: "Imprint",
      privacy: "Privacy",
      terms: "Terms",
    },
    contactLabels: { email: "Email", phone: "Phone", web: "Web", locations: "Locations" },
    rights: "All rights reserved.",
    langLabel: "Language",
    contact: {
      heading: "Contact",
      lead: "Write to us. We usually reply the same working day.",
      emailLabel: "Email",
      phoneLabel: "Phone",
      hoursLabel: "Availability",
      hours: "Mon–Fri, 08:00–18:00",
      addressLabel: "Address",
      address: "Weltpoststrasse 5\n3015 Bern",
    },
    form: {
      heading: "Send a message",
      name: "Your name",
      namePlaceholder: "First and last name",
      email: "Email address",
      emailPlaceholder: "name@company.ch",
      phone: "Phone",
      phonePlaceholder: "+41 79 000 00 00",
      message: "Your message",
      messagePlaceholder: "What is it about?",
      submit: "Submit",
      subject: "Enquiry via leadsengine.ch",
      sent: "Mail app opened.",
      required: "Required",
      privacy: "Your details are used only to answer your enquiry.",
      errors: {
        name: "Please enter your name.",
        email: "Please enter your email.",
        emailInvalid: "That email address does not look valid.",
        phone: "Please enter a phone number.",
        message: "Please enter a message.",
      },
    },
  },

  trusted: {
    label: "Companies that trust us",
    clientLogo: "Client logo",
    byline: "Leads Engine is a product of Future Media.",
  },


  video: {
    kicker: "Explained in 2 minutes",
    title: "How Leads Engine works.",
    lead: "What happens when a customer stops googling and starts asking.",
    play: "Play video",
    pause: "Pause",
    mute: "Mute",
    unmute: "Unmute",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    seek: "Video position",
    quality: "Quality",
    replay: "Replay",
    unsupported: "Your browser cannot play this video.",
  },

  legal: {
    imprint: {
      title: "Imprint",
      body: "Future Media GmbH\nWeltpoststrasse 5, 3015 Bern\nHardstrasse 201, 8005 Zurich\n\nEmail: info@future-media.ch\nPhone: 078 799 35 17\nWeb: future-media.ch\n\nLeads Engine is a product of Future Media GmbH.\nResponsible for content: the management of Future Media GmbH.\n\nAll content on this website is provided for general information. We check it with care, but assume no liability for completeness or accuracy, nor for the content of external links, which remains the responsibility of their operators.",
    },
    privacy: {
      title: "Privacy Policy",
      body: "Future Media GmbH, Bern and Zurich, processes personal data in line with the revised Swiss Federal Act on Data Protection (revFADP) and, where applicable, the EU GDPR.\n\nWhat we collect: site analytics run cookieless by default and do not build personal profiles. For the AI analysis we read only publicly accessible website content; no personal data is collected for it. If you contact us or request an analysis, we process the details you provide (name, email, company, website) solely to handle your request.\n\nHosting & transfer: data is processed on Swiss and EU infrastructure. We do not sell personal data and share it only with the processors required to operate this site (analytics, scheduling), under equivalent protection.\n\nYour rights: you may request access, correction or deletion of your personal data at any time. Contact: info@future-media.ch.",
    },
    terms: {
      title: "Terms of Service",
      body: "These terms govern the use of this website and the Leads Engine services provided by Future Media GmbH, Bern and Zurich.\n\nServices: the free AI analysis and the report review are non-binding. Monitoring, reporting, content and optimisation are delivered as agreed in the individual written agreement; scope, duration and remuneration are defined in the individual order.\n\nUse of this site: content is provided as-is. Reproduction or reuse of any content requires prior written consent. We may adjust or discontinue website content at any time.\n\nLiability: to the extent permitted by law, liability for indirect or consequential damages is excluded. Mandatory statutory liability remains unaffected.\n\nApplicable law: Swiss law. Place of jurisdiction is Bern, Switzerland.",
    },
    close: "Close",
  },
};
