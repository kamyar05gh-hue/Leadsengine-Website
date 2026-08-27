/**
 * A colour-coded pill. The three surfaces are derived from ONE hex by
 * appending an alpha suffix — `40` border, `1A` background, full-strength
 * text — so a caller passes a single colour and cannot get the three out of
 * step with each other.
 */
export default function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]"
      style={{ borderColor: `${color}66`, backgroundColor: `${color}1A`, color }}
    >
      {text}
    </span>
  );
}
