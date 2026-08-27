import { useLang } from '@/i18n/LanguageContext';

/**
 * Shown above the PageHeader when a live query failed and the page is
 * rendering reference data instead.
 *
 * THIS IS NOT DECORATION. Without it a reader has no way to tell modelled
 * numbers from measured ones, and a dashboard that quietly shows fiction
 * during an outage is worse than one that shows nothing. The upstream error
 * is carried in the title attribute rather than the line itself — enough to
 * debug, not enough to shout.
 */
export default function FallbackNotice({ message }: { message: string }) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap items-baseline gap-2 px-1">
      <span className="text-[14px] font-medium text-[#F06A6A]">{t.common.liveUnavailable}</span>
      <span className="truncate text-[12px] text-[#5C5C66]" title={message}>
        {t.common.showingSample} · {message}
      </span>
    </div>
  );
}
