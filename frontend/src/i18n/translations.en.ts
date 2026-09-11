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
    wissen: "Insights",
    menu: "Open menu",
    close: "Close menu",
  },

  cta: {
    primary: "Start your free AI analysis",
    secondary: "How it works",
    short: "Free analysis",
  },

  hero: {
    eyebrow: "Regional visibility for your audience",
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
    /* Verified figures; sources and exact values are recorded on the German
       dictionary's `data` block. Keep the two in step. */
    adoption: {
      title: "AI adoption in Switzerland",
      meta: "Share of adults using AI tools such as ChatGPT",
      years: ["2024", "2025", "2026"],
      values: [50, 62, 76],
      unit: "%",
      note: "Three in four adults, as of March 2026",
    },
    split: {
      title: "How B2B buyers use AI today",
      meta: "Gartner survey of 645 B2B buyers, Aug–Sep 2025",
      items: [
        { label: "Used GenAI in their latest purchase", share: 45 },
        { label: "Prefer to check AI insights with a sales rep", share: 69 },
        { label: "Find AI more misleading than sales reps", share: 51 },
      ],
    },
    engines: {
      title: "Which AI services send visitors in Switzerland",
      meta: "Share of website visits from AI chatbots, August 2026",
      items: [
        { label: "ChatGPT", share: 77 },
        { label: "Google Gemini", share: 11 },
        { label: "Perplexity", share: 5 },
        { label: "Claude", share: 4 },
        { label: "Microsoft Copilot", share: 3 },
      ],
    },
    shortlist: {
      title: "Brands per AI answer",
      meta: "How many brands ChatGPT names in one answer",
      value: 5.8,
      unit: "on average",
      note: "An AI answer has no page 2. Whoever is missing does not exist.",
      scale: ["Google: 10 results per page", "ChatGPT: almost 6 brands, Perplexity just over 4"],
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
    sources: "Sources: comparis survey (Innofact, n=1,035, March 2026) · Gartner survey of 645 B2B buyers (Aug–Sep 2025) · StatCounter Global Stats, Switzerland, August 2026 · BrightEdge, e-commerce queries, October 2025. The growth curve is a modelled trajectory, not a measurement.",
  },




  testimonials: {
    kicker: "Voices",
    title: "What clients say.",
    items: [
      {
        quote: "We were not aware that ChatGPT consistently named the same two competitors on the questions that matter. We are now named as well.",
        name: "Nina Brunner",
        role: "CMO, fintech · Zurich",
      },
      {
        quote: "I was sceptical at first. The first report showed very clearly where we actually stood in AI answers.",
        name: "Marc Wüthrich",
        role: "Head of Growth, SaaS · Basel",
      },
      {
        quote: "The pricing the AI was quoting for us was inaccurate. It was corrected within four weeks.",
        name: "Sofia Keller",
        role: "Head of Marketing, logistics · Bern",
      },
      {
        quote: "Our Google metrics held steady while enquiries fell. This is where that gap became visible.",
        name: "Daniel Aeschlimann",
        role: "Managing Director, manufacturing · Winterthur",
      },
    ],
  },

  analyse: {
    metaTitle: "Request your free AI analysis – Leads Engine",
    metaDescription:
      "Request the free AI visibility analysis. We check whether ChatGPT, Perplexity, Google AI, Claude and Grok recommend your company — results within 48 hours.",
    kicker: "Free AI analysis",
    title: "Find out whether AI recommends you.",
    lead: "In 48 hours you will know how you stand in ChatGPT & Co. Free, with no obligation.",
    fields: {
      name: "First and last name",
      namePlaceholder: "Anna Muster",
      email: "Email address",
      emailPlaceholder: "anna@company.ch",
      phone: "Phone",
      phonePlaceholder: "+41 79 000 00 00",
      role: "Your role in the company",
      rolePlaceholder: "Managing director, marketing …",
      website: "Website",
      websitePlaceholder: "company.ch",
    },
    consentShort: "I agree to the",
    privacyLink: "privacy policy",
    submit: "Request the free analysis",
    submitting: "Sending …",
    required: "Required",
    errors: {
      name: "Please enter your name.",
      email: "Please enter your email address.",
      emailInvalid: "That email address does not look valid.",
      phone: "Please enter your phone number.",
      role: "Please enter your role.",
      website: "Please enter your website.",
      consent: "Please confirm the privacy policy.",
      failed: "That did not work. Please try again, or write to us directly at info@leadsengine.ch.",
    },
    successTitle: "Request received",
    successBody: "Thank you – your request has reached us.",
    successDemand:
      "Because demand is high at the moment, preparing your personal AI analysis can take up to 48 hours.",
    successFollowUp: "As soon as your analysis is ready, we will come back to you personally.",
    successQuestion: "A question in the meantime?",
    successWriteTo: "Write to us at",
    successBack: "Back to the home page",
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
      sending: "Sending …",
      failed: "That did not work. Please try again, or write to us at info@leadsengine.ch.",
      sent: "Message sent. We will be in touch.",
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

  wissen: {
    index: {
      kicker: "Insights",
      title: "AI visibility, explained.",
      lead: "What Generative Engine Optimization is, how AI answers really work, and what Swiss companies can concretely do about it.",
      metaTitle: "Insights – GEO & AI Buyer Visibility | Leads Engine",
      metaDescription: "GEO and AEO basics: how ChatGPT, Perplexity and Google AI decide which companies to mention – and what that means for Swiss SMEs.",
      readMore: "Read the article",
    },
    posts: {
      wasIstGeo: {
        slug: "was-ist-geo",
        kicker: "Basics",
        title: "What is GEO? Generative Engine Optimization, explained simply",
        dek: "How ChatGPT, Perplexity and Google AI decide which companies to name in their answers – and what you can concretely do about it this week.",
        metaTitle: "What is GEO? Generative Engine Optimization explained | Leads Engine",
        metaDescription: "GEO stands for Generative Engine Optimization: optimizing content for AI answers instead of Google rankings. How it works – and what Swiss companies can do now.",
        date: "2026-09-06",
        dateLabel: "September 6, 2026",
        readingTime: "6 min read",
        intro: "GEO stands for Generative Engine Optimization. It means shaping a website so that ChatGPT, Perplexity, Google AI and similar systems name and cite it in their answers – rather than just appearing among the blue links of a classic search. The difference is not cosmetic: an AI answer typically names three to five providers and has no page two. A company missing from that list simply does not exist for that customer.",
        sections: [
          {
            heading: "What exactly is Generative Engine Optimization (GEO)?",
            paragraphs: [
              "GEO is the practice of shaping content so that generative AI systems select it as a source for an answer. Instead of optimizing for a position in a results list, GEO optimizes for being named inside an already-synthesized answer text.",
              "The term comes from a 2024 study presented at the KDD conference by researchers from Princeton University, Georgia Tech, the Allen Institute for AI, and IIT Delhi. They defined GEO as its own discipline because generative search systems select and weigh content differently than classic search engines do.",
            ],
          },
          {
            heading: "How is GEO different from classic SEO?",
            paragraphs: [
              "SEO optimizes for a position in a list of links that people browse themselves. GEO optimizes for being selected and named inside an already-generated, summarized answer text – one people read without clicking through at all.",
              "That changes what counts. Sitting on page two of Google is weak but still visible – someone searching can still click through. In an AI answer naming three to five providers, that middle ground does not exist: a source either becomes part of the answer, or it simply does not appear in it.",
            ],
          },
          {
            heading: "Why isn't a good Google ranking enough any more?",
            paragraphs: [
              "Because a growing share of purchase research no longer runs through classic search at all. According to a Gartner survey of 645 B2B buyers (2025), 45% used generative AI in their latest purchase, mainly to gather information on vendors and products. In Switzerland, three in four adults now use AI tools such as ChatGPT, according to comparis (March 2026); in 2024 it was half.",
              "A top Google position is just one of several signals a generative system takes into account – it does not guarantee a mention in the summarized answer. Both systems run in parallel, and both have to be served separately.",
            ],
          },
          {
            heading: "How does an AI decide which companies to name?",
            paragraphs: [
              "The KDD 2024 study tested this systematically. With their own benchmark, GEO-bench, the researchers ran roughly 10,000 queries across nine datasets and tested nine different optimization tactics.",
              "The strongest effects came from three tactics: adding citations, adding quotations, and adding statistics. Each raised how often a page was cited in a generated answer by roughly 30 to 40 percent in the study. Fluent language and an authoritative tone strengthened the effect further.",
              "The practical takeaway: content that itself contains verifiable facts, figures and sources is preferred by generative systems as a trustworthy basis for an answer.",
            ],
          },
          {
            heading: "What can you concretely do this week?",
            paragraphs: [
              "Three steps that don't require a big project. First: ask ChatGPT, Perplexity and Google AI directly what they know about your company and who they recommend instead – that shows the gap before you close it. Second: make sure your website states the facts a customer wants to know clearly and with real specifics (what you offer, where, for whom) – a system can only cite what is actually written down. Third: add structured data (JSON-LD), so machines don't have to guess those facts out of plain running text.",
              "Leads Engine measures exactly this automatically – as Mention, Citation and Share of Voice across ChatGPT, Perplexity, Google AI, Claude and Grok – and shows where the gap is in a free AI analysis within 48 hours.",
            ],
          },
        ],
        faq: [
          {
            q: "What does GEO stand for?",
            a: "Generative Engine Optimization. There is no established German equivalent term – the English term GEO is used essentially everywhere, including in German-speaking markets.",
          },
          {
            q: "Is GEO the same as AEO?",
            a: "In practice the two terms are often used interchangeably. AEO (Answer Engine Optimization) tends to emphasize direct-answer surfaces like AI overviews in search, GEO tends to emphasize generative chat answers – the underlying techniques overlap heavily.",
          },
          {
            q: "Can I do SEO and GEO at the same time?",
            a: "Yes, and most fundamentals overlap: real, current content, clear structure, verifiable facts. GEO adds signals that specifically matter to generative systems, such as citable sourcing and structured data.",
          },
          {
            q: "How long does it take for an AI to cite a new page?",
            a: "That depends on the crawling and indexing of the underlying search systems many AI answers draw on. Realistically, days to weeks, not hours – and it assumes the page gets indexed at all.",
          },
          {
            q: "Does it count if ChatGPT names my company but doesn't link to the site?",
            a: "Yes. That counts as a mention and is already a visibility signal. A citation with a direct link to the source is the stronger signal, but both are measurable and relevant to visibility.",
          },
        ],
        sourcesNote: "Sources: Aggarwal et al., “GEO: Generative Engine Optimization”, Princeton University / Georgia Tech / Allen Institute for AI / IIT Delhi, KDD 2024 (arXiv:2311.09735) – Gartner survey of 645 B2B buyers (Aug–Sep 2025) – comparis/Innofact AI survey (n=1,035, March 2026).",
      },
    },
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
      body:
        "Please note: Diese Allgemeinen Geschäftsbedingungen sind ausschliesslich auf Deutsch verbindlich. The terms below are reproduced in German because that is the only version Future Media GmbH publishes and the only one that is legally binding. An English translation would have no legal force and could differ in meaning. If you would like these terms explained in English, write to info@leadsengine.ch.\n\n1. Geltungsbereich: Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB“) gelten für alle über die Webseite www.future-media.ch oder direkt bei der Future Media Leuenberger GmbH, Trogamttweg 6, 3506 Grosshöchstetten, (nachfolgend „Future Media GmbH“) getätigten Anmeldungen und abgeschlossenen Verträge.\n\n2. Kursorganisation: Aus organisatorischen Gründen behält sich die Future Media GmbH vor, Kurse zeitlich zu verschieben oder zusammenzulegen, den Durchführungsort zu ändern oder Kurse bei prozentualer Rückerstattung des Kursgeldes zu kürzen. Fällt eine Kursleitung aus, kann die Future Media GmbH einen Kursleiterwechsel vornehmen oder eine Stellvertretung einsetzen. Die Future Media GmbH behält sich das Recht vor, den Unterricht im Klassenzimmer zu denselben Konditionen in Fernunterricht umzuwandeln, wenn die Durchführung des Unterrichts im Klassenzimmer nicht aufrechterhalten werden kann, z.B. durch höhere Gewalt oder andere Gründe.\n\n3. Kursplätze und Durchführung: Um die Kurse unter optimalen Bedingungen durchführen zu können, legt die Future Media GmbH für jedes Lernangebot eine minimale und maximale Teilnehmerzahl fest, welche bei Bedarf angepasst werden kann. Die Kursplätze werden in der Reihenfolge der Anmeldungen vergeben (unter Vorbehalt der rechtzeitigen Zahlung).\n\nBei ungenügender Teilnehmerzahl wird der Kurs in der Regel nicht durchgeführt und das Kursgeld erlassen bzw. zurückerstattet. Die Future Media GmbH behält sich weiter vor, aufgrund anderer, von der Future Media GmbH nicht zu vertretender Gründe, im Programm angekündigte Kurse abzusagen. Bereits bezahlte Kursgelder werden zurückerstattet. Weitergehende Ansprüche der Teilnehmenden, insbesondere Schadenersatzansprüche bei Änderungen oder Absage eines Kurses, sind ausdrücklich ausgeschlossen. Bei ungenügender Teilnehmerzahl eines Kurses kann es in Einzelfällen vorkommen, dass die Future Media GmbH den Kurs unter Vorbehalt des Einverständnisses der Teilnehmenden durchführt, jedoch das Kursgeld entsprechend erhöht oder, wo es sinnvoll ist, die Anzahl der Lektionen bei gleichbleibendem Preis reduziert.\n\n4. Kursausschluss: Die Future Media GmbH behält sich vor, Teilnehmende aus einem Kurs auszuschliessen. In folgenden Fällen ist das ganze Kursgeld geschuldet, d.h. es erfolgt weder eine anteilsmässige Rückerstattung noch ein Erlass des Kursgeldes: Kursausschluss aufgrund Nichtbezahlung des Kursgeldes sowie in schwerwiegenden Fällen (Ehrverletzung, Belästigung, vorsätzliche Sachbeschädigung etc.).\n\n5. An- und Abmeldungen, Zahlung des Kursgeldes: Jede Anmeldung ist verbindlich und verpflichtet den Teilnehmenden zur Zahlung des Kursgeldes. Die Preise verstehen sich in Schweizer Franken, exkl. allfälliger Mehrwertsteuer (MwSt.). Das Nichtbezahlen des Kursgeldes gilt nicht als Abmeldung. Nach der Anmeldung für einen Kurs erhält der Teilnehmende von der Future Media GmbH eine Anmeldebestätigung mit verbindlichen Zahlungsanweisungen.\n\nDie Dauer des Vertrags richtet sich nach dem gebuchten Kurs und ist befristet. Je nach Abmeldezeitpunkt kann die Future Media GmbH das Kursgeld gemäss folgender Regelung ganz oder teilweise erlassen. Bei Abmeldungen bis mindestens 7 Kalendertage vor Kursbeginn wird die Future Media GmbH das Kursgeld erlassen bzw. zurückerstatten, wobei eine Bearbeitungsgebühr von CHF 80.- erhoben wird. Die Abmeldung kann per E-Mail oder telefonisch erfolgen. Erfolgt die Abmeldung weniger als 7 Kalendertage vor Kursbeginn, ist das gesamte Kursgeld geschuldet.\n\nFür umfangreiche Offerten von individuellen Coachings sowie festen Reservierungen, die nicht in Anspruch genommen werden, behalten wir uns vor, eine Gebühr von CHF 190.- zu erheben.\n\n6. Nicht besuchte Kurse/ Coachings: Nicht besuchte Kurse/ Coachings können nicht nachgeholt werden und werden nicht zurückerstattet. Absagen müssen spätestens 24 Stunden vor dem vereinbarten Termin erfolgen.\n\n7. Kursbestätigung: Auf Wunsch des Teilnehmenden und nach erfolgtem Besuch von mindestens 80 Prozent der Kurslektionen, stellt die Future Media GmbH innert zwei Monaten ab Anfrage gerne eine Kursbestätigung aus. Abweichende Regelungen sind ausdrücklich vorbehalten.\n\n8. Haftungsausschluss und Versicherung: Für alle von der Future Media GmbH organisierten Kurse und Veranstaltungen schliesst die Future Media GmbH jegliche Haftung für entstandene Schäden aus. Teilnehmende sind für eine ausreichende Versicherungsdeckung verantwortlich. Das Benutzen der Anlagen der Future Media GmbH erfolgt auf eigene Gefahr. Für Diebstahl und Verlust von Gegenständen kann die Future Media GmbH nicht haftbar gemacht werden. Teilnehmende sind verpflichtet, in den Räumlichkeiten der Future Media GmbH die jeweils aktuellen behördlichen Weisungen (z.B. Hygieneregeln) sowie die Weisungen der Future Media GmbH einzuhalten. Der Besuch der Räumlichkeiten der Future Media GmbH (inkl. Partner, externe Workshops und an andere Unternehmen vermietete Räumlichkeiten) ist untersagt für Teilnehmende mit Krankheitssymptomen, bei Verdacht auf Ansteckung mit übertragbaren Krankheitserregern und/oder einer (behördlich oder selbst) verordneten Quarantäne. Das Ansteckungsrisiko kann selbst bei Einhaltung der Hygieneregeln nicht vollumfänglich ausgeschlossen werden. Die Future Media GmbH schliesst jede diesbezügliche Haftung aus.\n\nAus dem Nichterreichen von Lernzielen/-erfolg kann der Teilnehmende keine Rechte ableiten, insbesondere keine Rückerstattung von Kursgebühren.\n\n9. Datenschutz: Die Bearbeitung von Personendaten im Zusammenhang mit den Kursen der Future Media GmbH unterliegt der Datenschutzerklärung der Future Media GmbH. Die Datenschutzerklärung erläutert den Umgang der Future Media GmbH mit Personendaten unter anderem im Zusammenhang mit den Coachings und enthält insbesondere Angaben dazu, wofür Personendaten bearbeitet werden, wie sie in der Future Media GmbH weitergegeben werden und welche Rechte betroffene Personen mit Bezug auf ihre Personendaten haben. Mit der Anmeldung akzeptiert der Teilnehmende die damit gemäss Datenschutzerklärung verbundene Bearbeitung seiner Personendaten.\n\n10. Video- und Audio-Aufnahmen: Mit der Anmeldung geben Teilnehmende ihr Einverständnis, dass in den Räumlichkeiten der Future Media GmbH sowie im online Unterricht Video- und Audioaufnahmen gemacht werden dürfen.\n\n11. Programm-, Preis- und AGB-Änderungen: Die Future Media GmbH behält sich das Recht vor, das Programm, die Preise sowie die AGB jederzeit zu ändern. Massgebend ist jeweils die zum Zeitpunkt der Anmeldung geltende Version, welche für diesen Vertragsabschluss nicht einseitig geändert werden kann.\n\n12. Salvatorische Klausel: Sollte eine Bestimmung dieser AGB unwirksam oder unvollständig sein oder sollte die Erfüllung unmöglich werden, so werden dadurch die Wirksamkeit der übrigen Teile nicht beeinträchtigt. In einem solchen Fall ist die unwirksame Bestimmung durch eine zulässig wirksame Bestimmung zu ersetzen, durch die der beabsichtigte Vertragszweck in rechtlich zulässiger Weise erreicht werden kann und die nach ihrem Inhalt der ursprünglichen Absicht am nächsten kommt. Gleiches gilt im Falle einer Lücke.\n\n13. Anwendbares Recht und Gerichtsstand: Für alle Rechtsbeziehungen mit der Future Media GmbH ist materielles Schweizer Recht, unter vollständigem Ausschluss des Kollisionsrechts sowie des Übereinkommens der Vereinten Nationen über Verträge über den internationalen Warenkauf vom 11. April 1980, anwendbar.\n\nAusschliesslicher Gerichtsstand für sämtliche Streitigkeiten aus oder im Zusammenhang mit diesen AGB sowie den Kursen ist Bern, Schweiz.",
    },
    close: "Close",
  },
};
