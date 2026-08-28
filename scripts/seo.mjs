/**
 * SEO post-processing for the statically built subpages.
 *
 * THE PROBLEM THIS SOLVES. The subpages (`/ueber-uns/`, `/impressum/`,
 * `/datenschutz/`, `/agb/`) are client-rendered React entries, so the HTML a
 * crawler receives contains ZERO body text — measured, not assumed: the built
 * `ueber-uns/index.html` had 0 characters between `<body>` and `</body>`.
 *
 * Googlebot renders JavaScript and would eventually see them. The AI crawlers
 * mostly do NOT: GPTBot, PerplexityBot, ClaudeBot and friends fetch HTML and
 * read it. For a product whose entire promise is "we make you visible to AI
 * answer engines", shipping subpages those engines cannot read is the one
 * mistake the site cannot afford.
 *
 * THE FIX, AND WHY IT IS THIS ONE. Real prerendering (headless browser in the
 * build) is the textbook answer and was rejected: it adds a heavy dependency
 * and a browser download to every CI run, for four pages of mostly static
 * prose. Instead each page gets:
 *
 *   1. a `<noscript>` block containing the page's actual text as semantic
 *      HTML — headings and paragraphs, no styling, since a crawler wants the
 *      words and a no-JS human wants them readable
 *   2. per-page JSON-LD: a `WebPage`/`AboutPage` node and a `BreadcrumbList`
 *
 * NO COPY IS DUPLICATED HERE. The text is read from the SAME
 * `translations.*.ts` the app renders from, transpiled with esbuild (already
 * a Vite dependency) and imported — not scraped with regexes. An earlier
 * generation of this build did use hand-rolled regex extraction and it was a
 * steady source of bugs. Edit the dictionary and the fallback follows on the
 * next build; there is nothing to keep in sync by hand.
 *
 * RUNS AFTER the frontend build and BEFORE `security-headers.mjs`, because it
 * adds `<script type="application/ld+json">` blocks that the CSP must hash.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = join(ROOT, "frontend", "build");
const ORIGIN = "https://leadsengine.ch";

/* esbuild lives in the frontend workspace, not at the repo root. */
const require = createRequire(join(ROOT, "frontend", "package.json"));
const esbuild = require("esbuild");

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Transpile + bundle the dictionaries and site constants, then import them.
 * Bundling resolves the `@/` alias and the type-only import between the two
 * dictionaries without any of it having to be understood here.
 */
async function loadContent() {
  const tmp = mkdtempSync(join(tmpdir(), "le-seo-"));
  const entry = join(tmp, "entry.ts");
  const out = join(tmp, "content.mjs");

  writeFileSync(
    entry,
    `export { de } from "@/i18n/translations.de";
     export { en } from "@/i18n/translations.en";
     export { SITE } from "@/constants/site";
     export { TEAM } from "@/constants/team";`,
    "utf8",
  );

  await esbuild.build({
    entryPoints: [entry],
    outfile: out,
    bundle: true,
    format: "esm",
    platform: "node",
    logLevel: "silent",
    alias: { "@": join(ROOT, "frontend", "src") },
  });

  const mod = await import(pathToFileURL(out).href);
  rmSync(tmp, { recursive: true, force: true });
  return mod;
}

/** `<h2>` + paragraphs, the shape every block here reduces to. */
const block = (heading, paragraphs) =>
  `<h2>${escapeHtml(heading)}</h2>\n` +
  paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");

/** Blank-line-separated legal text becomes paragraphs. */
const legalParagraphs = (body) =>
  body
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("\n");

/**
 * THE FALLBACK MUST DESCRIBE THE PAGE THAT IS ACTUALLY RENDERED.
 *
 * This used to emit the whole long-form article — four prose sections, the
 * commitments block and the values list. That copy is still in the dictionary
 * but the page no longer renders any of it: "Uber uns" is now the team, in
 * portrait cards. Continuing to serve the article to anything that does not
 * run JavaScript would mean crawlers and AI systems reading a page no visitor
 * sees, which is the definition of cloaking — and a genuinely bad look for a
 * product whose whole pitch is what machines read about you.
 *
 * So it mirrors the rendered page instead: masthead, team lead line, and the
 * roster as a real list of names and roles. TEAM is imported rather than
 * retyped, so a member added to the site appears here on the next build.
 */
function aboutFallback(t, TEAM) {
  const page = t.about.page;
  const roles = t.about.roles || {};
  const people = TEAM.map(
    (m) => `<li>${escapeHtml(m.name)} \u2014 ${escapeHtml(roles[m.name] ?? m.role)}</li>`,
  ).join("\n");
  return [
    `<h1>${escapeHtml(page.heroTitle)}</h1>`,
    `<p>${escapeHtml(page.heroLead)}</p>`,
    /* `teamTitle` and `teamLead` were removed from the page and from the
       dictionaries; the fallback must not resurrect them. The kicker is what
       heads the section now. */
    `<h2>${escapeHtml(t.about.teamKicker)}</h2>`,
    `<ul>\n${people}\n</ul>`,
  ].join("\n");
}

/**
 * The crawler's view of /analyse/.
 *
 * It is a form, so there is no article to mirror — but an empty <noscript> on
 * the page every CTA points at would leave the site's single most important
 * URL with nothing for an engine that does not run JavaScript to read. What
 * it emits instead is what the page actually promises: the offer, the three
 * assurances, and what happens after you submit. No field labels: a crawler
 * cannot fill the form in, and listing inputs it cannot use is noise.
 */
function analyseFallback(t) {
  const a = t.analyse;
  return [
    `<h1>${escapeHtml(a.title)}</h1>`,
    `<p>${escapeHtml(a.lead)}</p>`,
    `<ul>\n${a.assurances.map((x) => `<li>${escapeHtml(x)}</li>`).join('\n')}\n</ul>`,
    block(a.stepsTitle, a.steps.map((x) => `${x.title}: ${x.body}`)),
  ].join('\n');
}

function legalFallback(t, doc) {
  const { title, body } = t.legal[doc];
  return `<h1>${escapeHtml(title)}</h1>\n${legalParagraphs(body)}`;
}

/**
 * Routes to process. `type` picks the schema.org page type; `crumb` is the
 * breadcrumb label, taken from the dictionary so it matches the visible nav.
 */
const ROUTES = [
  {
    /* The conversion page. `WebPage` rather than `ContactPage`: it is not a
       contact form, it is a request for a specific service, and the Service
       node in the home page's graph is what describes that service. */
    path: "analyse",
    type: "WebPage",
    crumb: (t) => t.analyse.kicker,
    fallback: analyseFallback,
    name: (t) => t.analyse.metaTitle,
    description: (t) => t.analyse.metaDescription,
  },
  {
    path: "ueber-uns",
    type: "AboutPage",
    crumb: (t) => t.nav.about,
    fallback: (t) => aboutFallback(t, content.TEAM),
    name: (t) => t.about.page.title,
    description: (t) => t.about.page.metaDescription,
  },
  ...[
    ["impressum", "imprint"],
    ["datenschutz", "privacy"],
    ["agb", "terms"],
  ].map(([path, doc]) => ({
    path,
    type: "WebPage",
    crumb: (t) => t.legal[doc].title,
    fallback: (t) => legalFallback(t, doc),
    name: (t) => t.legal[doc].title,
    description: (t) => t.legal[doc].body.replace(/\s+/g, " ").slice(0, 155).trim(),
  })),
];

const content = await loadContent();
const t = content.de; // German is the primary language and the default render.
const { SITE } = content;

/* ---------------------------------------------------------------------------
 * SITEMAP
 *
 * WHY IT IS GENERATED AND NOT A FILE IN public/.
 * It was a static file whose lastmod said 2026-08-24 for every URL, and it
 * kept saying that through a fortnight of daily changes. A stale lastmod is
 * worse than none: crawlers use it to decide what to re-fetch, so a site that
 * changes constantly was telling every engine it had not changed at all. On a
 * product whose entire proposition is being current inside AI answers, that
 * is the one signal that must not lie.
 *
 * Now it is written on every build from the BUILD TIME of the file each URL
 * actually serves, so a page that did not change keeps its old date and a
 * page that did gets a new one.
 *
 * The hreflang alternates are here as well as in each page's <head>. Search
 * engines accept either; having both means a crawler that reads the sitemap
 * first learns about the English variant without fetching the German page,
 * which is the case that matters for an answer engine assembling context.
 * ------------------------------------------------------------------------ */
function buildSitemap() {
  const urls = [
    { path: "", priority: "1.0", changefreq: "weekly" },
    { path: "analyse/", priority: "0.9", changefreq: "monthly" },
    { path: "ueber-uns/", priority: "0.8", changefreq: "monthly" },
    { path: "impressum/", priority: "0.3", changefreq: "yearly" },
    { path: "datenschutz/", priority: "0.3", changefreq: "yearly" },
    { path: "agb/", priority: "0.3", changefreq: "yearly" },
    /* llms.txt, at the client's request. It is not an HTML page, so it needs
       the `file` override below — there is no index.html to stat. Listing it
       is unusual and deliberate: the sitemap is the one file every crawler
       fetches without being told to, which makes it the most reliable way to
       point an answer engine at the plain-text summary written for it. */
    { path: "llms.txt", priority: "0.5", changefreq: "monthly", file: "llms.txt", noAlt: true },
  ];

  const body = urls
    .map(({ path, priority, changefreq, file, noAlt }) => {
      const onDisk = join(BUILD, file ?? join(path, "index.html"));
      /* The file's own mtime, not today's date: rebuilding without changing a
         page must not claim the page changed. */
      const lastmod = statSync(onDisk).mtime.toISOString().slice(0, 10);
      const loc = ORIGIN + "/" + path;
      return [
        "    <url>",
        `        <loc>${loc}</loc>`,
        ...(noAlt
          ? /* A plain-text resource has no language variants to declare. */ []
          : [
              `        <xhtml:link rel="alternate" hreflang="de-CH" href="${loc}?lang=de" />`,
              `        <xhtml:link rel="alternate" hreflang="en" href="${loc}?lang=en" />`,
              `        <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`,
            ]),
        `        <lastmod>${lastmod}</lastmod>`,
        `        <changefreq>${changefreq}</changefreq>`,
        `        <priority>${priority}</priority>`,
        "    </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    body,
    "</urlset>",
    "",
  ].join("\n");
}

writeFileSync(join(BUILD, "sitemap.xml"), buildSitemap(), "utf8");
console.log("  sitemap.xml               regenerated with real lastmod");

const written = [];

for (const route of ROUTES) {
  const file = join(BUILD, route.path, "index.html");
  let html = readFileSync(file, "utf8");

  if (html.includes("data-seo-fallback")) {
    throw new Error(`seo: ${route.path} already processed — run on a clean build`);
  }

  const url = `${ORIGIN}/${route.path}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": route.type,
        "@id": `${url}#webpage`,
        url,
        name: route.name(t),
        description: route.description(t),
        inLanguage: "de-CH",
        isPartOf: { "@id": `${ORIGIN}/#website` },
        about: { "@id": `${ORIGIN}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE.brand, item: `${ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: route.crumb(t), item: url },
        ],
      },
    ],
  };

  /* The fallback is hidden from the rendered page by `<noscript>` itself —
     the browser only shows it when scripting is off — so it needs no styling
     and can never interfere with the React render. */
  const fallback =
    `<noscript data-seo-fallback>\n<main>\n${route.fallback(t)}\n` +
    `<p><a href="/">${escapeHtml(t.about.page.backLabel)}</a></p>\n</main>\n</noscript>`;

  const ld = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

  html = html.replace("</head>", `    ${ld}\n  </head>`);
  html = html.replace('<div id="root"', `${fallback}\n    <div id="root"`);

  writeFileSync(file, html, "utf8");

  const chars = route.fallback(t).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
  written.push(`/${route.path}/ (${chars} chars)`);
}

console.log(`SEO fallbacks + JSON-LD: ${written.join(" · ")}`);
