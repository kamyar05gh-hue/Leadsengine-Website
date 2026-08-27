/** A labelled fill bar. Used for Core Web Vitals, where the useful reading
 *  is "how far through the good band is this", not the raw millisecond. */
export default function StatusBar({
  label,
  name,
  display,
  fill,
  color,
  statusLabel,
  thresholdHint,
}: {
  label: string;
  name: string;
  display: string;
  /** 0–1. Clamped at 100% so a very bad value cannot overflow the track. */
  fill: number;
  color: string;
  statusLabel: string;
  thresholdHint: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#16161A] bg-[#0E0E11] px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-[12.5px] font-medium text-white">{name}</span>
          <span className="truncate text-[11px] text-[#5C5C66]" title={label}>
            {label}
          </span>
        </div>
        <span className="text-[12.5px] font-medium tabular-nums" style={{ color }}>
          {display}
        </span>
      </div>
      <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-[#16161A]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(Math.max(fill, 0) * 100, 100)}%`, backgroundColor: color }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.08em]">
        <span style={{ color }}>{statusLabel}</span>
        <span className="text-[#5C5C66]">{thresholdHint}</span>
      </div>
    </div>
  );
}
