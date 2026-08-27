/**
 * Break a headline at its sentence boundaries, for the masked line reveal.
 *
 * Lifted verbatim out of the section files — `Audience.tsx`, `Benefits.tsx`,
 * `Problem.tsx` and `Pain.tsx` each carried their own identical copy. The
 * subpages need the same split, and a fifth copy is how the five quietly
 * drift apart, so it lives here once now.
 */
export function toLines(title: string): string[] {
  const parts = title.match(/[^.!?]+[.!?]*/g);
  if (!parts) return [title];
  const lines = parts.map((p) => p.trim()).filter(Boolean);
  return lines.length ? lines : [title];
}
