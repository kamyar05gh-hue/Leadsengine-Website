import type { ReactNode } from 'react';

/**
 * The base surface every content block sits on. 14px radius, 1px border,
 * #0B0B0D ground — and it does NOT change background on hover, because it is
 * not clickable. The clickable variant is `.tile` (see SummaryTile).
 */
export default function Card({
  title,
  meta,
  right,
  children,
  className = '',
}: {
  title: string;
  meta?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[14px] border border-[#1C1C21] bg-[#0B0B0D] p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <h2 className="truncate text-[17px] font-medium text-white">{title}</h2>
          {meta && <span className="shrink-0 text-[11.5px] text-[#5C5C66]">{meta}</span>}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
