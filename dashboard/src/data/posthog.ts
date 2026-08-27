// ---------------------------------------------------------------------------
// PostHog data layer — the ONLY place the dashboard talks to the API.
// All queries are HogQL over HTTPS against the project query endpoint.
// Every fetch takes `days` (default 30) and throws PosthogError on failure;
// pages catch that and fall back to mock data with a visible notice.
// ---------------------------------------------------------------------------

/**
 * PROXY BY DEFAULT — the key must not reach the browser.
 *
 * A PostHog *personal* API key grants full access to the project, and Vite
 * inlines every `VITE_*` value into the client bundle. Shipping the key that
 * way publishes it to anyone who opens the dashboard and views source.
 *
 * So in production the dashboard POSTs its HogQL to `/api/posthog.php`, a
 * server-side proxy that holds the key and is behind HTTP Basic auth. The
 * direct-to-PostHog path below is kept ONLY for local development, where
 * there is no PHP host — it activates just when a key is explicitly present
 * in a local `.env`, which is gitignored.
 */
const PROXY_URL =
  (import.meta.env.VITE_POSTHOG_PROXY as string | undefined) || '/api/posthog.php';

const HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.posthog.com';
const PROJECT_ID = import.meta.env.VITE_POSTHOG_PROJECT_ID as string | undefined;
const PERSONAL_KEY = import.meta.env.VITE_POSTHOG_PERSONAL_KEY as string | undefined;
const SITE_HOST =
  (import.meta.env.VITE_POSTHOG_SITE_HOST as string | undefined) || 'leadsengine.ch';

/** Direct calls happen only when a dev has put a key in their local .env. */
const USE_DIRECT = Boolean(PROJECT_ID && PERSONAL_KEY);

export class PosthogError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'PosthogError';
    this.status = status;
  }
}

interface HogqlQueryResponse {
  results?: unknown[][];
  columns?: string[];
}

/** Run a HogQL query and return its raw `results` rows, typed by the caller. */
export async function hogql<T>(sql: string): Promise<T> {
  const url = USE_DIRECT ? `${HOST}/api/projects/${PROJECT_ID}/query/` : PROXY_URL;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  /* The Authorization header exists ONLY on the dev-time direct path. In
     production the proxy adds it server-side and the browser never sees it. */
  if (USE_DIRECT) headers.Authorization = `Bearer ${PERSONAL_KEY}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      /* Basic-auth credentials for the proxy ride along automatically once
         the browser has them for /dashboard/, but only if the request is
         same-origin and credentials are included. */
      credentials: USE_DIRECT ? 'omit' : 'same-origin',
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: sql } }),
    });
  } catch (err) {
    throw new PosthogError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!res.ok) {
    throw new PosthogError(`PostHog query failed with HTTP ${res.status}`, res.status);
  }
  /* PARSING IS PART OF THE TRANSPORT, AND ITS FAILURE MUST LOOK LIKE ONE.
     `res.json()` throws a plain SyntaxError when the body is not JSON — which
     is exactly what a misconfigured proxy returns (an HTML error page, or the
     PHP source itself if the host stops executing PHP). Left unwrapped, that
     SyntaxError escaped this function as something other than a PosthogError,
     and the `catch (err) { if (err instanceof PosthogError) throw err; ... }`
     guards in fetchWebVitals / fetchDailyLcp / fetchExceptions — written to
     absorb SCHEMA differences — absorbed it too. The page then rendered a
     tidy "no data for this period" with no fallback notice, i.e. it reported
     a dead API as a quiet, healthy zero. Measured on a preview server that
     serves posthog.php as a static file. */
  let json: HogqlQueryResponse;
  try {
    json = (await res.json()) as HogqlQueryResponse;
  } catch (err) {
    throw new PosthogError(
      `PostHog returned a non-JSON response: ${err instanceof Error ? err.message : String(err)}`,
      res.status,
    );
  }
  if (!Array.isArray(json.results)) {
    throw new PosthogError('PostHog returned no result rows');
  }
  return json.results as T;
}

// ---------------------------------------------------------------------------
// Shared SQL fragments
// ---------------------------------------------------------------------------

function esc(value: string): string {
  return value.replace(/'/g, "\\'");
}

function windowFilter(days: number): string {
  const d = Math.max(1, Math.round(days));
  return `timestamp >= now() - interval ${d} day`;
}

function hostFilter(): string {
  return `properties.$host = '${esc(SITE_HOST)}'`;
}

function pvFilter(days: number): string {
  return `event = '$pageview' AND ${hostFilter()} AND ${windowFilter(days)}`;
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

// ---------------------------------------------------------------------------
// Typed interfaces
// ---------------------------------------------------------------------------

export interface TrafficSummary {
  visitors: number;
  pageviews: number;
  sessions: number;
}

export interface DailyPoint {
  date: string;
  visitors: number;
  pageviews: number;
  sessions: number;
}

export type ChannelKey = 'direct' | 'organic' | 'social' | 'referral' | 'ai';

export interface ChannelShare {
  key: ChannelKey;
  sessions: number;
  share: number; // 0–100
}

export interface PageRow {
  path: string;
  views: number;
  visitors: number;
}

export interface LandingRow {
  path: string;
  sessions: number;
  share: number; // 0–100
}

export interface DropOffRow {
  path: string;
  exits: number;
  views: number;
  exitRate: number; // 0–100
}

export interface EngagementStats {
  bounceRate: number; // 0–100
  avgDurationSec: number;
  pagesPerSession: number;
}

export interface ShareRow {
  name: string;
  visitors: number;
  share: number; // 0–100
}

export interface ConversionStats {
  primaryClicks: number;
  primarySessions: number;
  widgetClicks: number;
  widgetSessions: number;
  totalSessions: number;
  convSessions: number;
  convRate: number; // 0–100
  funnel: {
    sessions: number;
    engaged: number;
    cta: number;
    demo: number;
  };
}

export interface WebVitals {
  lcp: number | null; // ms
  inp: number | null; // ms
  cls: number | null; // unitless
  ttfb: number | null; // ms
}

export interface LcpPoint {
  date: string;
  lcp: number; // ms
}

export interface ExceptionsData {
  daily: { date: string; count: number }[];
  recent: { message: string; count: number; lastSeen: string }[];
  total: number;
}

export interface ActiveNow {
  active: number;
}

// ---------------------------------------------------------------------------
// Traffic
// ---------------------------------------------------------------------------

export async function fetchTrafficSummary(days = 30): Promise<TrafficSummary> {
  const rows = await hogql<[unknown, unknown, unknown][]>(`
    SELECT
      uniq(distinct_id) AS visitors,
      count() AS pageviews,
      uniq(properties.$session_id) AS sessions
    FROM events
    WHERE ${pvFilter(days)}
  `);
  const r = rows[0] ?? [0, 0, 0];
  return { visitors: num(r[0]), pageviews: num(r[1]), sessions: num(r[2]) };
}

export async function fetchDailySeries(days = 30): Promise<DailyPoint[]> {
  const rows = await hogql<[unknown, unknown, unknown, unknown][]>(`
    SELECT
      toDate(timestamp) AS day,
      uniq(distinct_id) AS visitors,
      count() AS pageviews,
      uniq(properties.$session_id) AS sessions
    FROM events
    WHERE ${pvFilter(days)}
    GROUP BY day
    ORDER BY day
  `);
  return rows.map((r) => ({
    date: str(r[0]),
    visitors: num(r[1]),
    pageviews: num(r[2]),
    sessions: num(r[3]),
  }));
}

const AI_REFERRERS = ['chatgpt.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai'];
const AI_SOURCES = ['chatgpt', 'perplexity', 'gemini', 'copilot', 'claude'];
const SOCIAL_REFERRERS = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 't.co', 'tiktok.com'];
const SOCIAL_SOURCES = ['facebook', 'instagram', 'linkedin', 'twitter', 'x', 'tiktok'];

function sqlList(values: string[]): string {
  return `(${values.map((v) => `'${esc(v)}'`).join(', ')})`;
}

export async function fetchChannels(days = 30): Promise<ChannelShare[]> {
  // Classify each session by the referrer / UTM of its FIRST pageview.
  const rows = await hogql<[unknown, unknown][]>(`
    SELECT channel, count() AS sessions
    FROM (
      SELECT
        properties.$session_id AS sid,
        argMin(multiIf(
          ifNull(properties.$referring_domain, '') IN ${sqlList(AI_REFERRERS)}
            OR ifNull(properties.utm_source, '') IN ${sqlList(AI_SOURCES)}, 'ai',
          ifNull(properties.utm_medium, '') = 'organic'
            OR positionCaseInsensitive(ifNull(properties.$referring_domain, ''), 'google') > 0
            OR positionCaseInsensitive(ifNull(properties.$referring_domain, ''), 'bing') > 0
            OR positionCaseInsensitive(ifNull(properties.$referring_domain, ''), 'duckduckgo') > 0
            OR positionCaseInsensitive(ifNull(properties.$referring_domain, ''), 'yahoo') > 0
            OR positionCaseInsensitive(ifNull(properties.$referring_domain, ''), 'ecosia') > 0, 'organic',
          ifNull(properties.$referring_domain, '') IN ${sqlList(SOCIAL_REFERRERS)}
            OR ifNull(properties.utm_source, '') IN ${sqlList(SOCIAL_SOURCES)}, 'social',
          ifNull(properties.$referring_domain, '') = ''
            OR ifNull(properties.$referring_domain, '') = '$direct', 'direct',
          'referral'
        ), timestamp) AS channel
      FROM events
      WHERE ${pvFilter(days)}
      GROUP BY sid
    )
    GROUP BY channel
  `);
  const byKey = new Map<ChannelKey, number>();
  let total = 0;
  for (const r of rows) {
    const key = str(r[0]) as ChannelKey;
    const sessions = num(r[1]);
    byKey.set(key, sessions);
    total += sessions;
  }
  const order: ChannelKey[] = ['direct', 'organic', 'social', 'referral', 'ai'];
  return order.map((key) => {
    const sessions = byKey.get(key) ?? 0;
    return { key, sessions, share: total > 0 ? (sessions / total) * 100 : 0 };
  });
}

export async function fetchTopPages(days = 30): Promise<PageRow[]> {
  const rows = await hogql<[unknown, unknown, unknown][]>(`
    SELECT
      properties.$pathname AS path,
      count() AS views,
      uniq(distinct_id) AS visitors
    FROM events
    WHERE ${pvFilter(days)}
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `);
  return rows.map((r) => ({ path: str(r[0]), views: num(r[1]), visitors: num(r[2]) }));
}

export async function fetchLandingPages(days = 30): Promise<LandingRow[]> {
  const rows = await hogql<[unknown, unknown][]>(`
    SELECT path, count() AS sessions
    FROM (
      SELECT
        properties.$session_id AS sid,
        argMin(properties.$pathname, timestamp) AS path
      FROM events
      WHERE ${pvFilter(days)}
      GROUP BY sid
    )
    GROUP BY path
    ORDER BY sessions DESC
    LIMIT 10
  `);
  const total = rows.reduce((sum, r) => sum + num(r[1]), 0);
  return rows.map((r) => ({
    path: str(r[0]),
    sessions: num(r[1]),
    share: total > 0 ? (num(r[1]) / total) * 100 : 0,
  }));
}

export async function fetchDropOffPages(days = 30): Promise<DropOffRow[]> {
  const rows = await hogql<[unknown, unknown, unknown][]>(`
    SELECT l.path AS path, l.exits AS exits, v.views AS views
    FROM (
      SELECT path, count() AS exits
      FROM (
        SELECT
          properties.$session_id AS sid,
          argMax(properties.$pathname, timestamp) AS path
        FROM events
        WHERE ${pvFilter(days)}
        GROUP BY sid
      )
      GROUP BY path
    ) AS l
    JOIN (
      SELECT properties.$pathname AS path, count() AS views
      FROM events
      WHERE ${pvFilter(days)}
      GROUP BY path
    ) AS v ON l.path = v.path
    ORDER BY exits DESC
    LIMIT 10
  `);
  return rows.map((r) => {
    const exits = num(r[1]);
    const views = num(r[2]);
    return { path: str(r[0]), exits, views, exitRate: views > 0 ? (exits / views) * 100 : 0 };
  });
}

// ---------------------------------------------------------------------------
// Engagement
// ---------------------------------------------------------------------------

export async function fetchEngagement(days = 30): Promise<EngagementStats> {
  const rows = await hogql<[unknown, unknown, unknown][]>(`
    SELECT
      countIf(views = 1) / count() * 100 AS bounce_rate,
      avg(duration) AS avg_duration,
      avg(views) AS pages_per_session
    FROM (
      SELECT
        properties.$session_id AS sid,
        count() AS views,
        dateDiff('second', min(timestamp), max(timestamp)) AS duration
      FROM events
      WHERE ${pvFilter(days)}
      GROUP BY sid
    )
  `);
  const r = rows[0] ?? [0, 0, 0];
  return {
    bounceRate: num(r[0]),
    avgDurationSec: num(r[1]),
    pagesPerSession: num(r[2]),
  };
}

/**
 * Average session duration per calendar day.
 *
 * Duration is derived, not stored: PostHog has no session-length property on
 * a $pageview, so a session's length is the span between its first and last
 * pageview. That systematically UNDERSTATES the last page of every session
 * (time on the final page is invisible, since nothing marks its end) and
 * reports single-pageview sessions as 0 seconds. Both are inherent to
 * pageview-derived timing and are the same convention `fetchEngagement`
 * uses, so the daily series and the headline average always agree.
 */
export async function fetchDailyDuration(
  days = 30,
): Promise<{ date: string; avgSessionSec: number }[]> {
  const rows = await hogql<[unknown, unknown][]>(`
    SELECT day, avg(duration) AS avg_duration
    FROM (
      SELECT
        toDate(min(timestamp)) AS day,
        properties.$session_id AS sid,
        dateDiff('second', min(timestamp), max(timestamp)) AS duration
      FROM events
      WHERE ${pvFilter(days)}
      GROUP BY sid
    )
    GROUP BY day
    ORDER BY day
  `);
  return rows.map((r) => ({ date: str(r[0]).slice(0, 10), avgSessionSec: num(r[1]) }));
}

// ---------------------------------------------------------------------------
// Audience — one generic share query for device / OS / browser / geo
// ---------------------------------------------------------------------------

type ShareProperty = '$device_type' | '$os' | '$browser' | '$geoip_country_name' | '$geoip_city_name';

async function shareQuery(property: ShareProperty, days = 30): Promise<ShareRow[]> {
  const rows = await hogql<[unknown, unknown][]>(`
    SELECT
      if(notEmpty(toString(properties.${property})), toString(properties.${property}), 'Unknown') AS name,
      uniq(distinct_id) AS visitors
    FROM events
    WHERE ${pvFilter(days)}
    GROUP BY name
    ORDER BY visitors DESC
    LIMIT 8
  `);
  const total = rows.reduce((sum, r) => sum + num(r[1]), 0);
  return rows.map((r) => ({
    name: str(r[0]),
    visitors: num(r[1]),
    share: total > 0 ? (num(r[1]) / total) * 100 : 0,
  }));
}

export function fetchDeviceSplit(days = 30): Promise<ShareRow[]> {
  return shareQuery('$device_type', days);
}

export function fetchOs(days = 30): Promise<ShareRow[]> {
  return shareQuery('$os', days);
}

export function fetchBrowsers(days = 30): Promise<ShareRow[]> {
  return shareQuery('$browser', days);
}

export function fetchCountries(days = 30): Promise<ShareRow[]> {
  return shareQuery('$geoip_country_name', days);
}

export function fetchCities(days = 30): Promise<ShareRow[]> {
  return shareQuery('$geoip_city_name', days);
}

// ---------------------------------------------------------------------------
// Conversions — autocapture clicks split by marker class (pm-cta / pm-cta-btn)
// ---------------------------------------------------------------------------

export async function fetchConversions(days = 30): Promise<ConversionStats> {
  const clickRows = await hogql<[unknown, unknown, unknown, unknown, unknown][]>(`
    SELECT
      countIf(elements_chain LIKE '%pm-cta-btn%') AS primary_clicks,
      countIf(elements_chain LIKE '%pm-cta%' AND elements_chain NOT LIKE '%pm-cta-btn%') AS widget_clicks,
      uniqIf(properties.$session_id, elements_chain LIKE '%pm-cta-btn%') AS primary_sessions,
      uniqIf(properties.$session_id, elements_chain LIKE '%pm-cta%' AND elements_chain NOT LIKE '%pm-cta-btn%') AS widget_sessions,
      uniqIf(properties.$session_id, elements_chain LIKE '%pm-cta%') AS conv_sessions
    FROM events
    WHERE event = '$autocapture'
      AND ${hostFilter()}
      AND ${windowFilter(days)}
      AND elements_chain LIKE '%pm-cta%'
  `);
  const sessionRows = await hogql<[unknown, unknown][]>(`
    SELECT
      count() AS sessions,
      countIf(views >= 2) AS engaged
    FROM (
      SELECT properties.$session_id AS sid, count() AS views
      FROM events
      WHERE ${pvFilter(days)}
      GROUP BY sid
    )
  `);
  const c = clickRows[0] ?? [0, 0, 0, 0, 0];
  const s = sessionRows[0] ?? [0, 0];
  const totalSessions = num(s[0]);
  const convSessions = num(c[4]);
  return {
    primaryClicks: num(c[0]),
    primarySessions: num(c[2]),
    widgetClicks: num(c[1]),
    widgetSessions: num(c[3]),
    totalSessions,
    convSessions,
    convRate: totalSessions > 0 ? (convSessions / totalSessions) * 100 : 0,
    funnel: {
      sessions: totalSessions,
      engaged: num(s[1]),
      cta: convSessions,
      demo: num(c[2]),
    },
  };
}

// ---------------------------------------------------------------------------
// Performance — web vitals + exceptions. Defensive: schema differences turn
// into nulls / empty arrays so the page renders EmptyState instead of failing.
// PosthogError (missing config, network, HTTP) still propagates so the page
// can fall back to mock reference data like every other page.
// ---------------------------------------------------------------------------

export async function fetchWebVitals(days = 30): Promise<WebVitals> {
  try {
    const rows = await hogql<[unknown, unknown, unknown, unknown][]>(`
      SELECT
        quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_LCP_value))) AS lcp,
        quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_INP_value))) AS inp,
        quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_CLS_value))) AS cls,
        quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_TTFB_value))) AS ttfb
      FROM events
      WHERE event = '$web_vitals'
        AND ${hostFilter()}
        AND ${windowFilter(days)}
    `);
    const r = rows[0] ?? [null, null, null, null];
    const orNull = (v: unknown): number | null => {
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    return { lcp: orNull(r[0]), inp: orNull(r[1]), cls: orNull(r[2]), ttfb: orNull(r[3]) };
  } catch (err) {
    if (err instanceof PosthogError) throw err;
    return { lcp: null, inp: null, cls: null, ttfb: null };
  }
}

export async function fetchDailyLcp(days = 30): Promise<LcpPoint[]> {
  try {
    const rows = await hogql<[unknown, unknown][]>(`
      SELECT
        toDate(timestamp) AS day,
        quantile(0.75)(toFloat64OrNull(toString(properties.$web_vitals_LCP_value))) AS lcp
      FROM events
      WHERE event = '$web_vitals'
        AND ${hostFilter()}
        AND ${windowFilter(days)}
      GROUP BY day
      ORDER BY day
    `);
    return rows
      .map((r) => ({ date: str(r[0]), lcp: Number(r[1]) }))
      .filter((p) => Number.isFinite(p.lcp));
  } catch (err) {
    if (err instanceof PosthogError) throw err;
    return [];
  }
}

export async function fetchExceptions(days = 30): Promise<ExceptionsData> {
  try {
    const dailyRows = await hogql<[unknown, unknown][]>(`
      SELECT toDate(timestamp) AS day, count() AS count
      FROM events
      WHERE event = '$exception'
        AND ${hostFilter()}
        AND ${windowFilter(days)}
      GROUP BY day
      ORDER BY day
    `);
    const recentRows = await hogql<[unknown, unknown, unknown][]>(`
      SELECT
        if(notEmpty(toString(properties.$exception_message)), toString(properties.$exception_message), 'Unknown') AS message,
        count() AS count,
        max(timestamp) AS last_seen
      FROM events
      WHERE event = '$exception'
        AND ${hostFilter()}
        AND ${windowFilter(days)}
      GROUP BY message
      ORDER BY last_seen DESC
      LIMIT 5
    `);
    const daily = dailyRows.map((r) => ({ date: str(r[0]), count: num(r[1]) }));
    return {
      daily,
      recent: recentRows.map((r) => ({
        message: str(r[0]),
        count: num(r[1]),
        lastSeen: str(r[2]),
      })),
      total: daily.reduce((sum, d) => sum + d.count, 0),
    };
  } catch (err) {
    if (err instanceof PosthogError) throw err;
    return { daily: [], recent: [], total: 0 };
  }
}

// ---------------------------------------------------------------------------
// Realtime
// ---------------------------------------------------------------------------

export async function fetchActiveNow(): Promise<ActiveNow> {
  const rows = await hogql<[unknown][]>(`
    SELECT uniq(distinct_id) AS active
    FROM events
    WHERE event = '$pageview'
      AND ${hostFilter()}
      AND timestamp >= now() - interval 5 minute
  `);
  return { active: num(rows[0]?.[0]) };
}
