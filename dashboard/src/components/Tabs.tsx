/**
 * Text + a 2px accent underline. Never a pill, never a segmented container —
 * that is the whole visual identity of this control.
 */
export default function Tabs({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className="tab"
          role="tab"
          aria-selected={value === opt}
          data-active={value === opt}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
