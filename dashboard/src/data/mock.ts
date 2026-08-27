// ---------------------------------------------------------------------------
// Deterministic mock data — mirrors every interface in posthog.ts.
// Swiss-flavoured reference data (~1.2k monthly visitors), used whenever the
// live PostHog API is unreachable. A seeded PRNG keeps every import and every
// 30 s refresh tick stable; only the calendar day shifts the window.
// ---------------------------------------------------------------------------

import type {
  ActiveNow,
  ChannelShare,
  ConversionStats,
  DailyPoint,
  DropOffRow,
  EngagementStats,
  ExceptionsData,
  LandingRow,
  LcpPoint,
  PageRow,
  ShareRow,
  TrafficSummary,
  WebVitals,
} from './posthog';

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260101);

function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

/** Scale a 30-day reference figure to the requested range. */
function scale(days: number): number {
  return Math.max(1, days) / 30;
}

// Fixed 90-day daily series, generated once at module load.
const SERIES_90: DailyPoint[] = (() => {
  const points: DailyPoint[] = [];
  for (let i = 89; i >= 0; i--) {
    const date = isoDay(i);
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 0.55 : 1;
    const wave = 1 + 0.18 * Math.sin(i / 6.5);
    const visitors = Math.round((34 + rand() * 16) * weekend * wave);
    const pageviews = Math.round(visitors * (2.1 + rand() * 0.5));
    const sessions = Math.round(visitors * (1.15 + rand() * 0.1));
    points.push({ date, visitors, pageviews, sessions });
  }
  return points;
})();

const LCP_90: LcpPoint[] = SERIES_90.map((p, i) => ({
  date: p.date,
  lcp: Math.round(1900 + 320 * Math.sin(i / 5.2) + (rand() - 0.5) * 260),
}));

export function mockDailySeries(days = 30): DailyPoint[] {
  return SERIES_90.slice(-Math.max(1, Math.min(90, days)));
}

export function mockDailyLcp(days = 30): LcpPoint[] {
  return LCP_90.slice(-Math.max(1, Math.min(90, days)));
}

export function mockTrafficSummary(days = 30): TrafficSummary {
  const k = scale(days);
  return {
    visitors: Math.round(1240 * k),
    pageviews: Math.round(2860 * k),
    sessions: Math.round(1480 * k),
  };
}

export function mockChannels(days = 30): ChannelShare[] {
  const k = scale(days);
  const mix: [ChannelShare['key'], number][] = [
    ['direct', 0.34],
    ['organic', 0.31],
    ['referral', 0.13],
    ['ai', 0.12],
    ['social', 0.1],
  ];
  const total = 1480 * k;
  return mix.map(([key, share]) => ({
    key,
    sessions: Math.round(total * share),
    share: share * 100,
  }));
}

export function mockTopPages(days = 30): PageRow[] {
  const k = scale(days);
  const pages: [string, number, number][] = [
    ['/', 920, 610],
    ['/en/aeo', 410, 285],
    ['/en/services', 350, 240],
    ['/de', 330, 225],
    ['/en/pricing', 240, 175],
    ['/en/cases', 190, 140],
    ['/en/blog/ai-search-visibility', 150, 120],
    ['/en/about', 110, 90],
    ['/en/contact', 95, 80],
    ['/de/aeo', 85, 65],
  ];
  return pages.map(([path, views, visitors]) => ({
    path,
    views: Math.round(views * k),
    visitors: Math.round(visitors * k),
  }));
}

export function mockLandingPages(days = 30): LandingRow[] {
  const k = scale(days);
  const pages: [string, number][] = [
    ['/', 520],
    ['/en/aeo', 260],
    ['/de', 210],
    ['/en/blog/ai-search-visibility', 140],
    ['/en/services', 120],
    ['/en/pricing', 90],
    ['/en/cases', 70],
    ['/de/aeo', 45],
  ];
  const total = pages.reduce((sum, [, s]) => sum + s, 0);
  return pages.map(([path, sessions]) => ({
    path,
    sessions: Math.round(sessions * k),
    share: (sessions / total) * 100,
  }));
}

export function mockDropOffPages(days = 30): DropOffRow[] {
  const k = scale(days);
  const pages: [string, number, number][] = [
    ['/', 300, 920],
    ['/en/pricing', 120, 240],
    ['/en/contact', 75, 95],
    ['/en/aeo', 140, 410],
    ['/de', 105, 330],
    ['/en/services', 95, 350],
    ['/en/cases', 45, 190],
  ];
  return pages.map(([path, exits, views]) => ({
    path,
    exits: Math.round(exits * k),
    views: Math.round(views * k),
    exitRate: (exits / views) * 100,
  }));
}

/** Mirrors fetchDailyDuration. Derived from the same 90-day series so the
 *  reference dashboard is internally consistent across pages. */
export function mockDailyDuration(days = 30): { date: string; avgSessionSec: number }[] {
  return mockDailySeries(days).map((p, i) => ({
    date: p.date,
    avgSessionSec: Math.round(96 + 26 * Math.sin(i / 4.3) + (p.pageviews / Math.max(p.sessions, 1)) * 18),
  }));
}

export function mockEngagement(): EngagementStats {
  return { bounceRate: 41.2, avgDurationSec: 134, pagesPerSession: 2.4 };
}

export function mockConversions(days = 30): ConversionStats {
  const k = scale(days);
  const totalSessions = Math.round(1480 * k);
  const primarySessions = Math.round(totalSessions * 0.031);
  const widgetSessions = Math.round(totalSessions * 0.014);
  const convSessions = primarySessions + widgetSessions;
  return {
    primaryClicks: Math.round(primarySessions * 1.24),
    primarySessions,
    widgetClicks: Math.round(widgetSessions * 1.18),
    widgetSessions,
    totalSessions,
    convSessions,
    convRate: (convSessions / totalSessions) * 100,
    funnel: {
      sessions: totalSessions,
      engaged: Math.round(totalSessions * 0.59),
      cta: convSessions,
      demo: primarySessions,
    },
  };
}

export function mockWebVitals(): WebVitals {
  return { lcp: 1900, inp: 180, cls: 0.08, ttfb: 620 };
}

export function mockExceptions(days = 30): ExceptionsData {
  const exRand = mulberry32(77031);
  const daily = mockDailySeries(days).map((p, i) => ({
    date: p.date,
    count: i % 6 === 0 ? 0 : Math.floor(exRand() * 3),
  }));
  return {
    daily,
    recent: [
      { message: "Cannot read properties of undefined (reading 'map')", count: 6, lastSeen: isoDay(0) },
      { message: 'Failed to fetch', count: 4, lastSeen: isoDay(1) },
      { message: 'ResizeObserver loop limit exceeded', count: 3, lastSeen: isoDay(2) },
      { message: 'ChunkLoadError: Loading chunk 412 failed', count: 2, lastSeen: isoDay(4) },
    ],
    total: daily.reduce((sum, d) => sum + d.count, 0),
  };
}

function shareRows(rows: [string, number][], days: number): ShareRow[] {
  const k = scale(days);
  const total = rows.reduce((sum, [, v]) => sum + v, 0);
  return rows.map(([name, visitors]) => ({
    name,
    visitors: Math.round(visitors * k),
    share: (visitors / total) * 100,
  }));
}

export function mockDeviceSplit(days = 30): ShareRow[] {
  return shareRows(
    [
      ['Desktop', 770],
      ['Mobile', 420],
      ['Tablet', 50],
    ],
    days,
  );
}

export function mockOs(days = 30): ShareRow[] {
  return shareRows(
    [
      ['Windows', 570],
      ['Mac OS X', 420],
      ['iOS', 150],
      ['Android', 75],
      ['Linux', 25],
    ],
    days,
  );
}

export function mockBrowsers(days = 30): ShareRow[] {
  return shareRows(
    [
      ['Chrome', 720],
      ['Safari', 300],
      ['Edge', 110],
      ['Firefox', 75],
      ['Samsung Internet', 35],
    ],
    days,
  );
}

export function mockCountries(days = 30): ShareRow[] {
  return shareRows(
    [
      ['Switzerland', 720],
      ['Germany', 260],
      ['Austria', 110],
      ['United States', 60],
      ['France', 40],
      ['United Kingdom', 30],
      ['Netherlands', 20],
    ],
    days,
  );
}

export function mockCities(days = 30): ShareRow[] {
  return shareRows(
    [
      ['Zurich', 385],
      ['Bern', 150],
      ['Basel', 110],
      ['Geneva', 100],
      ['Munich', 75],
      ['Lausanne', 50],
      ['Winterthur', 40],
      ['Lucerne', 30],
    ],
    days,
  );
}

export function mockActiveNow(): ActiveNow {
  return { active: 3 };
}
