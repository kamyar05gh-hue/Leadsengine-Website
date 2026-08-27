import { ArrowUpRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { CHART } from '@/lib/chart';

/**
 * The clickable KPI tile — Overview only. Carries the `.tile` hover law:
 * the SURFACE never changes, only the border, a 2px lift and a soft shadow.
 *
 * `spark` is decorative and is marked `aria-hidden`: it has no axes, no
 * labels and no tooltip, so there is nothing in it a screen reader could
 * usefully read out. The number above it is the content.
 */
export default function SummaryTile({
  label,
  value,
  takeaway,
  spark,
  onClick,
}: {
  label: string;
  value: string;
  takeaway: string;
  spark?: number[];
  onClick: () => void;
}) {
  /* The gradient id must be unique per tile or two tiles on the same page
     share one <defs> entry and the second renders with the first's fill. */
  const gid = `spark-${label.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <button type="button" className="tile group w-full p-4 text-left" onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76] transition-colors duration-[140ms] group-hover:text-[#A6A6AF]">
          {label}
        </span>
        <ArrowUpRight
          size={14}
          strokeWidth={1.5}
          className="shrink-0 text-[#5C5C66] transition-all duration-[140ms] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-[#8FB4F2]"
        />
      </div>
      <div className="mt-2.5 text-[22px] font-medium tabular-nums text-white">{value}</div>
      {spark && spark.length > 1 && (
        <div className="mt-2.5 h-[38px]" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={spark.map((v, i) => ({ i, v }))}
              margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.line} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={CHART.line} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={CHART.line}
                strokeWidth={1.5}
                fill={`url(#${gid})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-2.5 truncate text-[11.5px] text-[#5C5C66]" title={takeaway}>
        {takeaway}
      </div>
    </button>
  );
}
