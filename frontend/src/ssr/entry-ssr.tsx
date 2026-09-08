/**
 * The server half of the build. One module, one export, one job: hand
 * `scripts/prerender.mjs` the same React tree the browser renders, so the
 * built HTML carries the page's words instead of an empty `<div id="root">`.
 *
 * WHY THIS EXISTS. Measured 08.09.2026 against the live site: a crawler
 * fetching `/` read 232 characters. The German dictionary holds 56,017. Google
 * had indexed one page of six, with a snippet from a previous version of the
 * domain, and none of twelve buyer questions put to Google AI Overview or
 * Perplexity named this company. The technical SEO was already right — robots,
 * llms.txt, JSON-LD, canonicals, sitemap — so the missing piece was never a
 * tag. It was that the pages had no text in them.
 *
 * THERE IS NO SECOND COPY OF THE PAGE TREE HERE, and that is deliberate: this
 * file imports `App` and the same page components `src/entries/*.tsx` mount,
 * so a section added to the site cannot silently fail to reach a crawler. The
 * only thing this file decides is which component belongs to which URL, which
 * is exactly what `frontend/vite.config.ts` already decides for the client.
 */
import type { ReactElement } from "react";
import { LanguageProvider } from "@/i18n/LanguageContext";
import App from "@/App";
import About from "@/pages/About";
import Analyse from "@/pages/Analyse";
import Legal, { type LegalDoc } from "@/pages/Legal";

/** Keyed by the built file's directory, exactly as `prerender.mjs` walks it. */
export const ROUTES: Record<string, () => ReactElement> = {
  "index.html": () => <App />,
  "ueber-uns/index.html": () => <About />,
  "analyse/index.html": () => <Analyse />,
  "impressum/index.html": () => <Legal doc={"imprint" as LegalDoc} />,
  "datenschutz/index.html": () => <Legal doc={"privacy" as LegalDoc} />,
  "agb/index.html": () => <Legal doc={"terms" as LegalDoc} />,
};

/**
 * Wrapped in the same provider the client uses. `LanguageProvider` reads
 * `window` for the visitor's choice and now short-circuits to German when
 * there is no window, which is the correct thing to serve a crawler.
 */
export function renderRoute(key: string): ReactElement {
  const build = ROUTES[key];
  if (!build) throw new Error(`prerender: no route registered for ${key}`);
  return <LanguageProvider>{build()}</LanguageProvider>;
}
