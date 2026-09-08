/**
 * Put the page's actual words into the built HTML.
 *
 * THE PROBLEM THIS SOLVES, measured 08.09.2026 on the live site:
 *
 *     route            text   <noscript>   verdict
 *     /                 232         686    under 6000
 *     /analyse/          46         244    under 1500
 *     /ueber-uns/        40         551    under 1500
 *
 * 1.6% of the copy written into this app reached a machine that does not run
 * JavaScript. `scripts/seo.mjs` had already spotted this and injects a
 * <noscript> summary per page, which was the right instinct and not enough:
 * <noscript> is a fallback element and whether an extractor keeps it is not
 * something this site controls. The number to plan against is the one outside
 * it. Google AI Overview, PerplexityBot, OAI-SearchBot and ClaudeBot fetch
 * HTML; they are not browsers.
 *
 * WHY renderToPipeableStream AND NOT renderToString. Ten of the home page's
 * thirteen sections are `React.lazy` behind a single `<Suspense fallback=
 * {null}>` (see the note in App.tsx explaining why). `renderToString` cannot
 * resolve a lazy component: it renders the fallback, so a naive prerender
 * would have emitted the header, the hero and nothing else — a third of the
 * page, while reporting success. The streaming renderer waits, and
 * `onAllReady` fires only once every boundary has resolved, so what lands in
 * the file is the whole document.
 *
 * WHY VITE BUILDS THE SSR BUNDLE AND NOT ESBUILD. `TrustedBy.tsx` discovers
 * the client logos with `import.meta.glob`, which is a Vite feature. esbuild
 * leaves it as a property access on `import.meta`, so the module throws the
 * moment it is imported. Vite's own SSR build understands the glob, the `@`
 * alias, the `?url` asset imports and the CSS imports, which is the entire
 * reason this step shells out to Vite rather than reusing the esbuild helper
 * in `scripts/seo.mjs`.
 *
 * THE CLIENT STILL USES createRoot, NOT hydrateRoot, and that is a considered
 * choice rather than an oversight. Hydration requires the first client render
 * to match the server byte for byte, and this page is full of components that
 * legitimately cannot: `usePrefersReducedMotion` reads matchMedia, `Counter`
 * starts at zero and counts up, `useInView` starts false, `LanguageProvider`
 * reads `?lang=` and localStorage. Making all of those agree on their first
 * paint is a dozen behavioural changes to animation-heavy components on a live
 * commercial site, and it buys nothing a crawler can see. createRoot discards
 * the server markup and renders fresh, so the visitor's experience is exactly
 * what it is today, while the crawler gets the full document. Hydration is a
 * sensible follow-up; it is not a prerequisite.
 *
 * Runs AFTER `vite build` and BEFORE `scripts/seo.mjs`, because seo.mjs adds
 * JSON-LD and a <noscript> fallback and refuses to run twice on one build.
 */
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { Writable } from "node:stream";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FRONTEND = join(ROOT, "frontend");
const BUILD = join(FRONTEND, "build");
const SSR_OUT = join(FRONTEND, ".ssr-tmp");

/* React and Vite live in the frontend workspace, not at the repo root where
   this script sits, so both are resolved from there rather than by bare
   specifier — the same approach `scripts/seo.mjs` uses for esbuild. */
const require = createRequire(join(FRONTEND, "package.json"));
const { renderToPipeableStream } = await import(
  pathToFileURL(require.resolve("react-dom/server")).href
);

/* ------------------------------------------------------------------ build */
const { build } = await import(pathToFileURL(require.resolve("vite")).href);

console.log("  prerender: building the SSR bundle");
await build({
  root: FRONTEND,
  logLevel: "error",
  build: {
    ssr: join(FRONTEND, "src", "ssr", "entry-ssr.tsx"),
    outDir: SSR_OUT,
    emptyOutDir: true,
    /* The client build already emitted the real CSS. This pass only needs the
       markup, so anything it writes besides the module is discarded below. */
    cssCodeSplit: false,
    minify: false,
    rollupOptions: { output: { entryFileNames: "entry-ssr.mjs" } },
  },
});

const mod = await import(pathToFileURL(join(SSR_OUT, "entry-ssr.mjs")).href);

/* ----------------------------------------------------------------- render */
/**
 * Collect the stream rather than pipe it to a response. `onAllReady` is the
 * whole point: it holds until every lazy() section has resolved, which is what
 * makes the ten code-split sections appear in the output at all.
 */
function renderToHtml(element) {
  return new Promise((resolvePromise, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _enc, cb) { html += chunk.toString("utf8"); cb(); },
      final(cb) { cb(); resolvePromise(html); },
    });

    const { pipe, abort } = renderToPipeableStream(element, {
      onAllReady() { pipe(sink); },
      onShellError: reject,
      onError: reject,
    });

    /* A lazy chunk that never resolves must fail the build rather than ship a
       page with a hole in it. */
    setTimeout(() => { abort(new Error("prerender: timed out after 30s")); }, 30000).unref?.();
  });
}

/**
 * Replace the contents of `<div id="root">` while keeping its attributes.
 *
 * DONE BY COUNTING DIVS, NOT BY REGEX, because the three shells disagree in
 * ways a pattern kept getting wrong: `/` wraps a painted placeholder div so a
 * slow load is a dark frame rather than a white flash, the legal routes carry
 * `data-doc` (which selects the document and MUST survive), and in the BUILT
 * file Vite has hoisted the module script into <head>, so the mount node is
 * followed by `</body>` rather than the `<script>` the source shell has.
 * Walking the tags is shorter than a pattern that survives all of that.
 */
function injectIntoRoot(html, markup, key) {
  const open = html.match(/<div id="root"([^>]*)>/);
  if (!open) throw new Error(`prerender: ${key} has no <div id="root"> to fill.`);

  const attrs = open[1];
  const contentStart = open.index + open[0].length;

  let depth = 1;
  const tag = /<div\b[^>]*>|<\/div>/g;
  tag.lastIndex = contentStart;
  let m;
  while ((m = tag.exec(html))) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) {
      return html.slice(0, open.index) +
             `<div id="root"${attrs}>${markup}</div>` +
             html.slice(m.index + m[0].length);
    }
  }
  throw new Error(`prerender: ${key} has an unbalanced <div id="root">.`);
}

/**
 * Delete every HTML comment from the shipped page.
 *
 * THIS IS NOT A BYTE SAVING. It is the difference between the prerendered
 * text being readable and being deleted.
 *
 * Each shell carries a build note that reads, in prose, "Activated from a real
 * <script> at the foot of <body>". That is a valid HTML comment. But an
 * extractor does not parse HTML: it strips `<script>…</script>` blocks FIRST,
 * which consumes the literal `<script>` inside that comment along with the
 * comment's own `-->` terminator. The comment is now unterminated, so the
 * comment pass that follows runs on to the NEXT `-->` in the document — one of
 * React's `<!-- -->` text separators, 24,000 characters later — and takes the
 * entire page body with it.
 *
 * Measured on the built `/agb/` before this ran: 38,509 characters of HTML in,
 * 691 characters of text out, with the whole AGB body gone. The words were in
 * the file and no extractor could see them.
 *
 * Comments are stripped BEFORE anything else touches the markup, while they
 * are still well formed, which is the only order in which this is safe. The
 * notes stay in source where they belong; they were never for the browser.
 */
const stripHtmlComments = (html) => html.replace(/<!--[\s\S]*?-->/g, "");

/** React's Suspense bookkeeping. Harmless to a browser, noise to an extractor. */
const stripSuspenseMarkers = (html) =>
  html.replace(/<!--\$-->|<!--\/\$-->|<!--\$\?-->|<!--\$!-->|<!--\/\$\?-->/g, "");

const results = [];

for (const key of Object.keys(mod.ROUTES)) {
  const file = join(BUILD, key);
  if (!existsSync(file)) {
    console.log(`  prerender: ${key} not in the build, skipped`);
    continue;
  }

  const markup = stripSuspenseMarkers(await renderToHtml(mod.renderRoute(key)));

  /* Injected first, then stripped once over the whole document, so this
     catches both the shell's build notes and React's own `<!-- -->` text
     separators. Safe in either order here because this pass parses comments
     directly; it is the EXTRACTOR removing scripts first that turns a comment
     mentioning `<script>` into a 24,000-character deletion. See the note on
     stripHtmlComments. */
  let html = injectIntoRoot(readFileSync(file, "utf8"), markup, key);
  html = stripHtmlComments(html);
  writeFileSync(file, html, "utf8");

  const text = markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
  results.push(`${key.replace("/index.html", "") || "/"} ${text}`);
}

rmSync(SSR_OUT, { recursive: true, force: true });
console.log(`  prerender: ${results.join(" · ")} chars of markup`);
