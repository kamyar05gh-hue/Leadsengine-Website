// Recharts tokens. One place, so no page invents its own axis colour.
//
// TWO PALETTES, ON PURPOSE. `--accent` (#f97316, orange) is the INTERACTION
// colour: active tab, active nav underline, nothing else. The series colours
// below are a separate, fixed data-viz palette in a cool family — they have to
// stay distinguishable from each other across four overlaid series, which a
// single-hue orange ramp cannot do, and they must never be confused with the
// "this is the thing you selected" signal that the accent carries.

import type { CSSProperties } from 'react';

export const CHART = {
  /** Primary series / sparkline stroke. */
  line: '#8FB4F2',
  /** Secondary series. */
  line2: '#5B8DEF',
  /** Tertiary series — also the "good" state everywhere. */
  line3: '#3ECF8E',
  /** Quaternary series. */
  line4: '#D5518A',
  grid: '#1a1a1a',
  tooltip: {
    backgroundColor: '#16161A',
    border: '1px solid #1C1C21',
    borderRadius: 8,
    fontSize: 12,
    color: '#fff',
  } as CSSProperties,
  tooltipLabel: { color: '#C9C9D1' } as CSSProperties,
  tick: { fill: '#5C5C66', fontSize: 11 } as const,
  legend: { fontSize: 11, color: '#8A8A93' } as const,
};

/** Axes never draw their own line or ticks — the grid does that job. */
export const AXIS_COMMON = {
  axisLine: false as const,
  tickLine: false as const,
  tick: CHART.tick,
};

/** Line/area charts. */
export const CURSOR_LINE = { stroke: '#33333C' } as const;
/** Bar charts — the same wash a hovered list row gets. */
export const CURSOR_BAR = { fill: 'rgba(255,255,255,0.028)' } as const;

/* Status colours. Shared by StatusBar, Badge and the vitals thresholds so a
   "good" LCP and a "good" error state are literally the same green. */
export const STATUS = {
  good: '#3ECF8E',
  warn: '#E8A04C',
  bad: '#F06A6A',
  muted: '#8A8A93',
} as const;
