import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { de, type Dict } from "@/i18n/translations.de";
import { en } from "@/i18n/translations.en";

export type Lang = "en" | "de";

const DICTS: Record<Lang, Dict> = { en, de };
const STORAGE_KEY = "le-lang";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };

const LanguageContext = createContext<Ctx | null>(null);

function initialLang(): Lang {
  const url = new URLSearchParams(window.location.search).get("lang");
  if (url === "de" || url === "en") return url;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "de" || stored === "en") return stored;
  /* GERMAN ALWAYS, BY INSTRUCTION. The browser language is deliberately NOT
     consulted any more: this is a Swiss site whose primary market is German
     speaking, and an English-locale browser — which plenty of Swiss users
     run — was landing on the English site by default. A visitor who wants
     English still gets it from `?lang=en` or the switcher, and that choice
     is remembered above. */
  return "de";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = DICTS[lang].meta.htmlLang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    window.localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
    const w = window as unknown as { leadsengine?: { capture: (e: string, p?: unknown) => void } };
    w.leadsengine?.capture("language_switch", { language: l });
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
