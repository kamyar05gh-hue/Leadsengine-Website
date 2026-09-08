/**
 * How many characters of text each page hands a crawler that does not run
 * JavaScript. This is the number the whole visibility problem turns on, so it
 * is worth being able to check it in one command rather than by argument.
 *
 *   node scripts/crawlable-text.mjs                 # the live site
 *   node scripts/crawlable-text.mjs frontend/build  # a build, before deploy
 *
 * Counted the way an answer engine's extractor counts: script, style and
 * comments removed, tags stripped, whitespace collapsed. <noscript> is
 * reported SEPARATELY and not added to the total, because whether a given
 * engine keeps it varies and is not something this site controls. Plan
 * against the number outside it.
 *
 * Baseline measured 08.09.2026 on the live site, for comparison:
 *   /  232   /analyse/ 46   /ueber-uns/ 40   /impressum/ 24
 *   /datenschutz/ 35   /agb/ 18
 * Median Swiss rival named by the engines instead: 12,617 on the homepage.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROUTES = ["/", "/analyse/", "/ueber-uns/", "/impressum/",
                "/datenschutz/", "/agb/", "/wissen/",
                "/wissen/was-ist-geo/"];
const TARGET_HOME = 6000;   // what the homepage must clear once prerendered
const TARGET_PAGE = 1500;   // what every other page must clear

const strip = (html) => {
  let h = html.replace(/<(script|style|template|svg)\b[\s\S]*?<\/\1>/gi, " ");
  h = h.replace(/<!--[\s\S]*?-->/g, " ");
  h = h.replace(/<[^>]+>/g, " ");
  return h.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
};

const noscriptOf = (html) => {
  const blocks = html.match(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi) || [];
  return strip(blocks.join(" "));
};

const withoutNoscript = (html) =>
  strip(html.replace(/<noscript[\s\S]*?<\/noscript>/gi, " "));

const root = process.argv[2];

async function read(route) {
  if (root) {
    const file = join(root, route === "/" ? "index.html"
                                          : join(route, "index.html"));
    return existsSync(file) ? readFileSync(file, "utf8") : null;
  }
  const res = await fetch("https://leadsengine.ch" + route, {
    headers: { "User-Agent": "leadsengine-crawlable-check" },
  });
  return res.ok ? await res.text() : null;
}

console.log(root ? `Reading build at ${root}\n` : "Reading the live site\n");
console.log("route            text   <noscript>  comments   verdict");
console.log("-".repeat(62));

let failed = 0;
for (const route of ROUTES) {
  const html = await read(route);
  if (html === null) {
    console.log(`${route.padEnd(15)}   —          —         —   not found`);
    continue;
  }
  const text = withoutNoscript(html).length;
  const ns = noscriptOf(html).length;
  const comments = (html.match(/<!--[\s\S]*?-->/g) || [])
    .reduce((n, c) => n + c.length, 0);
  const target = route === "/" ? TARGET_HOME : TARGET_PAGE;
  const ok = text >= target;
  if (!ok) failed++;
  console.log(
    `${route.padEnd(15)}${String(text).padStart(5)}${String(ns).padStart(12)}` +
    `${String(comments).padStart(10)}   ${ok ? "ok" : `under ${target}`}`);
}

console.log("-".repeat(62));
if (failed) {
  console.log(`${failed} route(s) below target. The pages are not readable ` +
              `without JavaScript.`);
  process.exitCode = 1;
} else {
  console.log("Every route serves its text without JavaScript.");
}
