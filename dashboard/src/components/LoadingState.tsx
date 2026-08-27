import { useLang } from '@/i18n/LanguageContext';

/** Whole-page loading. No spinner: a dashboard that resolves in well under a
 *  second gets a flash of spinner and nothing else, which reads as a glitch. */
export default function LoadingState({ text }: { text?: string }) {
  const { t } = useLang();
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <span className="text-[13px] text-[#5C5C66]">{text ?? t.common.loading}</span>
    </div>
  );
}
