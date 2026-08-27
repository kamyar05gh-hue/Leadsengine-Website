import {
  Area,
  AreaChart,
  CartesianGrid,
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
import SummaryTile from '@/components/SummaryTile';
import {
  mockActiveNow,
  mockChannels,
  mockConversions,
  mockDailySeries,
  mockEngagement,
  mockTopPages,
  mockTrafficSummary,
} from '@/data/mock';
import {
  fetchActiveNow,
  fetchChannels,
  fetchConversions,
  fetchDailySeries,
  fetchEngagement,
  fetchTopPages,
  fetchTrafficSummary,
  type ChannelShare,
  type ConversionStats,
  type DailyPoint,
  type EngagementStats,
  type PageRow,
  type TrafficSummary,
} from '@/data/posthog';
import { useLang } from '@/i18n/LanguageContext';
import { AXIS_COMMON, CHART, CURSOR_LINE } from '@/lib/chart';
import { fmtCompact, fmtDay, fmtDuration, fmtInt, fmtPct } from '@/lib/format';
import { useLiveQuery } from '@/lib/useLiveQuery';
import type { PageId } from '@/lib/types';

const DAYS = 30;

interface Vm {
  summary: TrafficSummary;
  series: DailyPoint[];
  channels: ChannelShare[];
  conv: ConversionStats;
  eng: EngagementStats;
  pages: PageRow[];
  active: number;
}

function mockVm(): Vm {
  return {
    summary: mockTrafficSummary(DAYS),
    series: mockDailySeries(DAYS),
    channels: mockChannels(DAYS),
    conv: mockConversions(DAYS),
    eng: mockEngagement(),
    pages: mockTopPages(DAYS),
    active: mockActiveNow().active,
  };
}

export default function Overview({
  tick,
  onNavigate,
}: {
  tick: number;
  onNavigate: (p: PageId) => void;
}) {
  const { t } = useLang();

  const { data, error, loading } = useLiveQuery<Vm>(async () => {
    const [summary, series, channels, conv, eng, pages, active] = await Promise.all([
      fetchTrafficSummary(DAYS),
      fetchDailySeries(DAYS),
      fetchChannels(DAYS),
      fetchConversions(DAYS),
      fetchEngagement(DAYS),
      fetchTopPages(DAYS),
      fetchActiveNow(),
    ]);
    return { summary, series, channels, conv, eng, pages, active: active.active };
  }, [tick]);

  if (loading && !data) return <LoadingState />;
  const vm = data ?? mockVm();

  const spark = (key: keyof DailyPoint) =>
    vm.series.slice(-14).map((p) => Number(p[key]) || 0);

  /* Eight tiles, each a doorway to the page that explains it. Order is the
     funnel itself: how many arrived, how much they looked at, how engaged
     they were, and what came out of it. */
  const tiles: {
    label: string;
    value: string;
    takeaway: string;
    spark?: number[];
    to: PageId;
  }[] = [
    {
      label: t.overview.visitors,
      value: fmtInt(vm.summary.visitors),
      takeaway: t.overview.hintVisitors,
      spark: spark('visitors'),
      to: 'traffic',
    },
    {
      label: t.overview.pageviews,
      value: fmtInt(vm.summary.pageviews),
      takeaway: t.overview.hintPageviews,
      spark: spark('pageviews'),
      to: 'traffic',
    },
    {
      label: t.overview.sessions,
      value: fmtInt(vm.summary.sessions),
      takeaway: t.overview.hintSessions,
      spark: spark('sessions'),
      to: 'traffic',
    },
    {
      label: t.overview.activeNow,
      value: fmtInt(vm.active),
      takeaway: t.overview.hintActive,
      to: 'audience',
    },
    {
      label: t.engagement.avgDuration,
      value: fmtDuration(vm.eng.avgDurationSec),
      takeaway: t.engagement.hintDuration,
      to: 'engagement',
    },
    {
      label: t.engagement.bounce,
      value: fmtPct(vm.eng.bounceRate),
      takeaway: t.engagement.hintBounce,
      to: 'engagement',
    },
    {
      label: t.overview.conversions,
      value: fmtInt(vm.conv.convSessions),
      takeaway: t.conversions.hintGoals,
      to: 'conversions',
    },
    {
      label: t.overview.convRate,
      value: fmtPct(vm.conv.convRate, 2),
      takeaway: t.overview.hintConv,
      to: 'conversions',
    },
  ];

  const chartData = vm.series.map((p) => ({
    label: fmtDay(p.date),
    visitors: p.visitors,
    pageviews: p.pageviews,
  }));

  const channelTotal = vm.channels.reduce((n, c) => n + c.sessions, 0);
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

  return (
    <>
      {error && <FallbackNotice message={error.message} />}

      <PageHeader
        kicker={t.overview.kicker}
        title={t.overview.title}
        description={t.overview.desc}
        stats={[
          { label: t.overview.activeNow, value: fmtInt(vm.active), tone: 'green', sub: t.common.live },
          { label: t.overview.visitors, value: fmtCompact(vm.summary.visitors), sub: t.common.period },
          { label: t.overview.convRate, value: fmtPct(vm.conv.convRate, 2) },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <SummaryTile
            key={tile.label}
            label={tile.label}
            value={tile.value}
            takeaway={tile.takeaway}
            spark={tile.spark}
            onClick={() => onNavigate(tile.to)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card title={t.overview.trend} meta={t.common.period} className="lg:col-span-3">
          {chartData.length === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -14 }}>
                  <defs>
                    <linearGradient id="ov-visitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.line} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={CHART.line} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ov-pageviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.line2} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={CHART.line2} stopOpacity={0} />
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
                    dataKey="pageviews"
                    name={t.overview.pageviews}
                    stroke={CHART.line2}
                    strokeWidth={1.5}
                    fill="url(#ov-pageviews)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name={t.overview.visitors}
                    stroke={CHART.line}
                    strokeWidth={1.5}
                    fill="url(#ov-visitors)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title={t.traffic.channels} meta={t.traffic.hintChannels} className="lg:col-span-2">
          {vm.channels.length === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <div className="flex flex-col gap-3">
              {vm.channels.map((c) => (
                <div key={c.key} className="row px-2 py-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-[13px] text-[#C9C9D1]">
                      <span
                        aria-hidden="true"
                        className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
                        style={{ backgroundColor: channelColor[c.key] }}
                      />
                      <span className="truncate">{channelLabel[c.key]}</span>
                    </span>
                    <span className="shrink-0 text-[13px] tabular-nums text-white">
                      {fmtInt(c.sessions)}
                    </span>
                  </div>
                  <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#16161A]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${channelTotal ? (c.sessions / channelTotal) * 100 : 0}%`,
                        backgroundColor: channelColor[c.key],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title={t.engagement.topPages} meta={t.common.period}>
        {vm.pages.length === 0 ? (
          <EmptyState message={t.common.noData} />
        ) : (
          <>
            <div className="grid grid-cols-[1fr_90px_100px] gap-3 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
              <span>{t.common.page}</span>
              <span className="text-right">{t.engagement.views}</span>
              <span className="text-right">{t.audience.visitors}</span>
            </div>
            {vm.pages.map((p) => (
              <div
                key={p.path}
                className="row grid grid-cols-[1fr_90px_100px] items-center gap-3 px-3 py-2.5 text-[13px]"
              >
                <span className="truncate text-[#C9C9D1]" title={p.path}>
                  {p.path}
                </span>
                <span className="text-right tabular-nums text-white">{fmtInt(p.views)}</span>
                <span className="text-right tabular-nums text-[#8A8A93]">{fmtInt(p.visitors)}</span>
              </div>
            ))}
          </>
        )}
      </Card>
    </>
  );
}
