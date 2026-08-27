// Number formatting helpers. Figures use de-CH grouping (1'234) to match the
// Swiss marketing site; all rendered in IBM Plex Mono with tabular-nums.

const intFmt = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 });
const compactFmt = new Intl.NumberFormat('de-CH', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function fmtInt(n: number): string {
  return intFmt.format(Math.round(n));
}

export function fmtCompact(n: number): string {
  return compactFmt.format(n);
}

export function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function fmtChf(n: number): string {
  return `CHF ${intFmt.format(Math.round(n))}`;
}

export function fmtMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${Math.round(ms)} ms`;
}

export function fmtDuration(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/** HH:MM:SS clock string (de-CH, 24 h). */
export function fmtClock(d: Date): string {
  return d.toLocaleTimeString('de-CH', { hour12: false });
}

/** Short axis label from an ISO day (2026-08-22 → 22.08). */
export function fmtDay(iso: string): string {
  const parts = iso.slice(0, 10).split('-');
  return parts.length === 3 ? `${parts[2]}.${parts[1]}` : iso;
}

/** U+2212. A hyphen-minus is narrower than a digit even in a tabular face, so
 *  a column of negative numbers sits a hair out of line with the positives. */
export const MINUS = '−';

/** Signed percentage-point delta: 8.2 -> "+8.2%", -3.1 -> "−3.1%". */
export function fmtDeltaPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '–';
  const v = Math.abs(n).toFixed(digits);
  if (n > 0) return `+${v}%`;
  if (n < 0) return `${MINUS}${v}%`;
  return `${v}%`;
}

/** Signed count delta, for "vs previous period" lines. */
export function fmtDelta(n: number): string {
  if (!Number.isFinite(n)) return '–';
  const v = intFmt.format(Math.abs(Math.round(n)));
  if (n > 0) return `+${v}`;
  if (n < 0) return `${MINUS}${v}`;
  return v;
}
