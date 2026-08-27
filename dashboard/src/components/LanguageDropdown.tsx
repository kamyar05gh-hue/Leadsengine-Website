import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/translations';

const LANGUAGES: { id: Lang; native: string; flag: string }[] = [
  { id: 'de', native: 'Deutsch', flag: '🇩🇪' },
  { id: 'en', native: 'English', flag: '🇬🇧' },
];

export default function LanguageDropdown() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.id === lang) ?? LANGUAGES[0];

  /* Outside-click close. A dropdown that can only be dismissed by clicking
     its own trigger again is a trap on touch, where there is no Escape key
     within reach. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#1C1C21] bg-[#0B0B0D] px-3 py-2 text-[12px] text-white transition-colors hover:border-[#2C2C33]"
      >
        <span className="flex items-center gap-2">
          <Globe size={14} className="text-[#6B6B76]" />
          <span className="truncate">
            {current.flag} {current.native}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[#6B6B76] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1.5 min-w-[9rem] rounded-lg border border-[#1C1C21] bg-[#0B0B0D] p-1 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
          role="listbox"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              role="option"
              aria-selected={lang === l.id}
              onClick={() => {
                setLang(l.id);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[12px] transition-colors ${
                lang === l.id ? 'text-white' : 'text-[#8A8A93] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span className="text-left">{l.native}</span>
              </span>
              {lang === l.id && <Check size={12} className="text-[#3ECF8E]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
