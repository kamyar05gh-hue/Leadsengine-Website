import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Wissen from "@/pages/Wissen";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <Wissen />
    </LanguageProvider>
  </StrictMode>,
);
