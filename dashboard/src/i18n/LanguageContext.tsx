import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { de, en, type DashDict, type Lang } from './translations';

const DICTS: Record<Lang, DashDict> = { en, de };
const STORAGE_KEY = 'le-lang';

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: DashDict };

const LanguageContext = createContext<Ctx | null>(null);

function initialLang(): Lang {
  const url = new URLSearchParams(window.location.search).get('lang');
  if (url === 'de' || url === 'en') return url;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'de' || stored === 'en') return stored;
  /* GERMAN, ALWAYS — same rule as the marketing site. `navigator.language`
     was the wrong signal: this dashboard has one audience, in Switzerland,
     and a browser set to English (extremely common here) is not a request
     for an English dashboard. An explicit choice still wins and is
     remembered. */
  return 'de';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    window.localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
