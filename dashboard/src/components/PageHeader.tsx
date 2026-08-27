export type Tone = 'green' | 'red' | 'gray' | 'white';

const TONE_COLOR: Record<Tone, string> = {
  green: '#3ECF8E',
  red: '#F06A6A',
  gray: '#8A8A93',
  white: '#FFFFFF',
};

export interface HeaderStat {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}

/** The banner at the top of every page: kicker, title, one line of context,
 *  and up to four figures that summarise the page in one glance. */
export default function PageHeader({
  kicker,
  title,
  description,
  stats,
}: {
  kicker: string;
  title: string;
  description: string;
  stats?: HeaderStat[];
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5 rounded-[14px] border border-[#1C1C21] bg-[#0B0B0D] px-6 py-5">
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#7C9BD4]">
          {kicker}
        </div>
        <h1 className="mt-2 text-[23px] font-medium leading-tight text-white">{title}</h1>
        <p className="mt-1.5 max-w-[620px] text-[12.5px] leading-relaxed text-[#8A8A93]">
          {description}
        </p>
      </div>
      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-7">
          {stats.map((s) => (
            <div key={s.label} className="min-w-[90px]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
                {s.label}
              </div>
              <div
                className="mt-1.5 text-[19px] font-medium tabular-nums"
                style={{ color: TONE_COLOR[s.tone ?? 'white'] }}
              >
                {s.value}
              </div>
              {s.sub && <div className="mt-0.5 text-[11px] text-[#5C5C66]">{s.sub}</div>}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
