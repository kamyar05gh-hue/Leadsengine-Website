import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@/i18n/LanguageContext";
import About from "@/pages/About";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <About />
    </LanguageProvider>
  </StrictMode>,
);
