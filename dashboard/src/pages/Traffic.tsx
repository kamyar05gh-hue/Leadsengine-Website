import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import FallbackNotice from '@/components/FallbackNotice';
import LoadingState from '@/components/LoadingState';
import PageHeader from '@/components/PageHeader';
import StatBox from '@/components/StatBox';
import Tabs from '@/components/Tabs';
import {
  mockChannels,
  mockDailySeries,
  mockEngagement,
  mockLandingPages,
  mockTrafficSummary,
} from '@/data/mock';
import {
  fetchChannels,
  fetchDailySeries,
  fetchEngagement,
  fetchLandingPages,
  fetchTrafficSummary,
  type ChannelShare,
  type DailyPoint,
  type EngagementStats,
  type LandingRow,
  type TrafficSummary,
} from '@/data/posthog';
import { useLang } from '@/i18n/LanguageContext';
import { AXIS_COMMON, CHART, CURSOR_BAR, CURSOR_LINE } from '@/lib/chart';
import { fmtCompact, fmtDay, fmtInt, fmtPct } from '@/lib/format';
import { useLiveQuery } from '@/lib/useLiveQuery';

/** The range picker's options, and the day count each one means. */
const RANGES: Record<string, number> = { '7D': 7, '30D': 30, '90D': 90 };

interface Vm {
  summary: TrafficSummary;
  series: DailyPoint[];
  channels: ChannelShare[];
  landing: LandingRow[];
  eng: EngagementStats;
}

function mockVm(days: number): Vm {
  return {
    summary: mockTrafficSummary(days),
    series: mockDailySeries(days),
    channels: mockChannels(days),
    landing: mockLandingPages(days),
    eng: mockEngagement(),
  };
}

export default function Traffic({ tick }: { tick: number }) {
  const { t } = useLang();
  const [range, setRange] = useState('30D');
  const days = RANGES[range] ?? 30;

  const { data, error, loading } = useLiveQuery<Vm>(async () => {
    const [summary, series, channels, landing, eng] = await Promise.all([
      fetchTrafficSummary(days),
      fetchDailySeries(days),
      fetchChannels(days),
      fetchLandingPages(days),
      fetchEngagement(days),
    ]);
    return { summary, series, channels, landing, eng };
  }, [tick, days]);

  if (loading && !data) return <LoadingState />;
  const vm = data ?? mockVm(days);

  const chartData = vm.series.map((p) => ({
    label: fmtDay(p.date),
    sessions: p.sessions,
    visitors: p.visitors,
    pageviews: p.pageviews,
  }));

  const channelLabel: Record<ChannelShare['key'], string> = {
    direct: t.traffic.chDirect,
    organic: t.traffic.chOrganic,
    social: t.traffic.chSocial,
    referral: t.traffic.chReferral,
    ai: t.traffic.chAi,
  };
  const channelColor: Record<ChannelShare['key'], string> = {
    organic: CHART.line,
    direct: CHART.line2,
    ai: CHART.line3,
    referral: CHART.line4,
    social: '#8A8A93',
  };

  const channelData = vm.channels.map((c) => ({
    name: channelLabel[c.key],
    sessions: c.sessions,
    fill: channelColor[c.key],
  }));

  const perSession = vm.summary.sessions
    ? vm.summary.pageviews / vm.summary.sessions
    : 0;
  const dailyAvg = vm.series.length
    ? vm.series.reduce((n, p) => n + p.sessions, 0) / vm.series.length
    : 0;

  return (
    <>
      {error && <FallbackNotice message={error.message} />}

      <PageHeader
        kicker={t.traffic.kicker}
        title={t.traffic.title}
        description={t.traffic.desc}
        stats={[
          { label: t.traffic.sessions, value: fmtCompact(vm.summary.sessions) },
          { label: t.overview.visitors, value: fmtCompact(vm.summary.visitors) },
          {
            label: t.engagement.bounce,
            value: fmtPct(vm.eng.bounceRate),
            tone: vm.eng.bounceRate > 60 ? 'red' : 'green',
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatBox
          label={t.traffic.sessions}
          value={fmtInt(vm.summary.sessions)}
          delta={t.common.lastDays.replace('{days}', String(days))}
        />
        <StatBox label={t.overview.visitors} value={fmtInt(vm.summary.visitors)} />
        <StatBox label={t.overview.pageviews} value={fmtInt(vm.summary.pageviews)} />
        <StatBox
          label={t.engagement.pagesPerSession}
          value={perSession.toFixed(2)}
          delta={t.engagement.hintPages}
        />
        <StatBox
          label={t.traffic.daily}
          value={fmtInt(dailyAvg)}
          delta={t.common.trend}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card
          title={t.traffic.daily}
          className="lg:col-span-3"
          right={
            <Tabs
              options={Object.keys(RANGES)}
              value={range}
              onChange={setRange}
              ariaLabel={t.common.period}
            />
          }
        >
          {chartData.length === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -14 }}>
                  <defs>
                    <linearGradient id="tr-sessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.line} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={CHART.line} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={CHART.grid} />
                  <XAxis dataKey="label" minTickGap={24} {...AXIS_COMMON} />
                  <YAxis width={54} tickFormatter={fmtCompact} {...AXIS_COMMON} />
                  <Tooltip
                    contentStyle={CHART.tooltip}
                    labelStyle={CHART.tooltipLabel}
                    cursor={CURSOR_LINE}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name={t.traffic.sessions}
                    stroke={CHART.line}
                    strokeWidth={1.5}
                    fill="url(#tr-sessions)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name={t.overview.visitors}
                    stroke={CHART.line2}
                    strokeWidth={1.5}
                    fill="none"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title={t.traffic.channels} meta={t.traffic.hintChannels} className="lg:col-span-2">
          {channelData.length === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={channelData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid horizontal={false} stroke={CHART.grid} />
                    <XAxis type="number" tickFormatter={fmtCompact} {...AXIS_COMMON} />
                    <YAxis type="category" dataKey="name" width={104} {...AXIS_COMMON} />
                    <Tooltip
                      contentStyle={CHART.tooltip}
                      labelStyle={CHART.tooltipLabel}
                      cursor={CURSOR_BAR}
                    />
                    <Bar dataKey="sessions" name={t.traffic.sessions} radius={[0, 4, 4, 0]}>
                      {channelData.map((d) => (
                        <Cell key={d.name} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {vm.channels.map((c) => (
                  <span
                    key={c.key}
                    className="flex items-center gap-2 text-[11px] text-[#8A8A93]"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-[7px] w-[7px] rounded-full"
                      style={{ backgroundColor: channelColor[c.key] }}
                    />
                    {channelLabel[c.key]}
                    <span className="tabular-nums text-[#5C5C66]">{fmtPct(c.share)}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card title={t.traffic.landing} meta={t.traffic.hintLanding}>
        {vm.landing.length === 0 ? (
          <EmptyState message={t.common.noData} />
        ) : (
          <>
            <div className="grid grid-cols-[1fr_90px_100px_110px] gap-3 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
              <span>{t.common.page}</span>
              <span className="text-right">{t.traffic.sessions}</span>
              <span className="text-right">{t.traffic.share}</span>
              <span />
            </div>
            {vm.landing.map((r) => (
              <div
                key={r.path}
                className="row grid grid-cols-[1fr_90px_100px_110px] items-center gap-3 px-3 py-2.5 text-[13px]"
              >
                <span className="truncate text-[#C9C9D1]" title={r.path}>
                  {r.path}
                </span>
                <span className="text-right tabular-nums text-white">{fmtInt(r.sessions)}</span>
                <span className="text-right tabular-nums text-[#8A8A93]">{fmtPct(r.share)}</span>
                {/* The bar repeats the number beside it on purpose: the figure
                    is the precise value, the bar is what makes the ranking
                    readable without reading every figure. */}
                <span className="h-[5px] overflow-hidden rounded-full bg-[#16161A]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.min(r.share, 100)}%`,
                      backgroundColor: CHART.line,
                    }}
                  />
                </span>
              </div>
            ))}
          </>
        )}
      </Card>
    </>
  );
}
