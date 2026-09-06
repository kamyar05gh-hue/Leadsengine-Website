import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "@/i18n/LanguageContext";
import WissenPost from "@/pages/WissenPost";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <WissenPost slug="wasIstGeo" />
    </LanguageProvider>
  </StrictMode>,
);
