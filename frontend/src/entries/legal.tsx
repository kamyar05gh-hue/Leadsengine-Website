import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Legal, { type LegalDoc } from "@/pages/Legal";
import "@/index.css";

/**
 * One entry shared by all three legal routes. Which document to render is read
 * from `data-doc` on the mount node, set in each route's own `index.html`, so
 * the three pages stay one component and one chunk rather than three
 * near-identical copies.
 */
const root = document.getElementById("root")!;
const doc = (root.dataset.doc as LegalDoc) ?? "imprint";

createRoot(root).render(
  <StrictMode>
    <LanguageProvider>
      <Legal doc={doc} />
    </LanguageProvider>
  </StrictMode>,
);
