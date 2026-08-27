/** Stands in for a chart or table that has no rows. Fixed height, so a page
 *  with an empty block does not reflow into a different shape than a full one. */
export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-[14px] border border-[#1C1C21] bg-[#0B0B0D]">
      <span className="text-[13px] text-[#5C5C66]">{message}</span>
    </div>
  );
}
