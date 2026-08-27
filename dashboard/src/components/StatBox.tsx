/** One cell of the dense 5-up KPI row that opens every page but Overview. */
export default function StatBox({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#1C1C21] bg-[#0B0B0D] px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
        {label}
      </div>
      <div className="mt-2.5 text-[24px] font-medium tabular-nums text-white">{value}</div>
      {delta && <div className="mt-1.5 text-[12px] tabular-nums text-[#8A8A93]">{delta}</div>}
    </div>
  );
}
