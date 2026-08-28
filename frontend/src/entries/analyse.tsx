import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Analyse from "@/pages/Analyse";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <Analyse />
    </LanguageProvider>
  </StrictMode>,
);
