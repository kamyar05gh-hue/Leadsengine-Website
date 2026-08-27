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
import StatBox from '@/components/StatBox';
import {
  mockDailyDuration,
  mockDeviceSplit,
  mockDropOffPages,
  mockEngagement,
  mockTopPages,
  mockTrafficSummary,
} from '@/data/mock';
import {
  fetchDailyDuration,
  fetchDeviceSplit,
  fetchDropOffPages,
  fetchEngagement,
  fetchTopPages,
  fetchTrafficSummary,
  type DropOffRow,
  type EngagementStats,
  type PageRow,
  type ShareRow,
  type TrafficSummary,
} from '@/data/posthog';
import { useLang } from '@/i18n/LanguageContext';
import { AXIS_COMMON, CHART, CURSOR_LINE } from '@/lib/chart';
import { fmtCompact, fmtDay, fmtDuration, fmtInt, fmtPct } from '@/lib/format';
import { useLiveQuery } from '@/lib/useLiveQuery';

const DAYS = 30;

interface Vm {
  eng: EngagementStats;
  duration: { date: string; avgSessionSec: number }[];
  devices: ShareRow[];
  drop: DropOffRow[];
  pages: PageRow[];
  summary: TrafficSummary;
}

function mockVm(): Vm {
  return {
    eng: mockEngagement(),
    duration: mockDailyDuration(DAYS),
    devices: mockDeviceSplit(DAYS),
    drop: mockDropOffPages(DAYS),
    pages: mockTopPages(DAYS),
    summary: mockTrafficSummary(DAYS),
  };
}

/** Device classes get their own fixed colours so the stacked bar and its
 *  legend cannot disagree, and so the same class is the same colour on the
 *  Audience page too. */
const DEVICE_COLORS = [CHART.line, CHART.line2, CHART.line3, CHART.line4, '#8A8A93'];

export default function Engagement({ tick }: { tick: number }) {
  const { t } = useLang();

  const { data, error, loading } = useLiveQuery<Vm>(async () => {
    const [eng, duration, devices, drop, pages, summary] = await Promise.all([
      fetchEngagement(DAYS),
      fetchDailyDuration(DAYS),
      fetchDeviceSplit(DAYS),
      fetchDropOffPages(DAYS),
      fetchTopPages(DAYS),
      fetchTrafficSummary(DAYS),
    ]);
    return { eng, duration, devices, drop, pages, summary };
  }, [tick]);

  if (loading && !data) return <LoadingState />;
  const vm = data ?? mockVm();

  const chartData = vm.duration.map((p) => ({
    label: fmtDay(p.date),
    seconds: Math.round(p.avgSessionSec),
  }));

  const deviceTotal = vm.devices.reduce((n, d) => n + d.visitors, 0);

  return (
    <>
      {error && <FallbackNotice message={error.message} />}

      <PageHeader
        kicker={t.engagement.kicker}
        title={t.engagement.title}
        description={t.engagement.desc}
        stats={[
          { label: t.engagement.avgDuration, value: fmtDuration(vm.eng.avgDurationSec) },
          {
            label: t.engagement.bounce,
            value: fmtPct(vm.eng.bounceRate),
            tone: vm.eng.bounceRate > 60 ? 'red' : 'green',
          },
          { label: t.engagement.pagesPerSession, value: vm.eng.pagesPerSession.toFixed(2) },
        ]}
      />

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
        <StatBox
          label={t.engagement.avgDuration}
          value={fmtDuration(vm.eng.avgDurationSec)}
          delta={t.engagement.hintDuration}
        />
        <StatBox
          label={t.engagement.bounce}
          value={fmtPct(vm.eng.bounceRate)}
          delta={t.engagement.hintBounce}
        />
        <StatBox
          label={t.engagement.pagesPerSession}
          value={vm.eng.pagesPerSession.toFixed(2)}
          delta={t.engagement.hintPages}
        />
        <StatBox label={t.traffic.sessions} value={fmtInt(vm.summary.sessions)} />
        <StatBox label={t.overview.pageviews} value={fmtInt(vm.summary.pageviews)} />
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-5">
        <Card title={t.engagement.durationTrend} meta={t.common.period} className="lg:col-span-3">
          {chartData.length === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -14 }}>
                  <defs>
                    <linearGradient id="en-duration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.line} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={CHART.line} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={CHART.grid} />
                  <XAxis dataKey="label" minTickGap={24} {...AXIS_COMMON} />
                  <YAxis
                    width={54}
                    tickFormatter={(v: number) => fmtDuration(v)}
                    {...AXIS_COMMON}
                  />
                  <Tooltip
                    contentStyle={CHART.tooltip}
                    labelStyle={CHART.tooltipLabel}
                    cursor={CURSOR_LINE}
                    formatter={(v) => fmtDuration(Number(v))}
                  />
                  <Area
                    type="monotone"
                    dataKey="seconds"
                    name={t.engagement.avgDuration}
                    stroke={CHART.line}
                    strokeWidth={1.5}
                    fill="url(#en-duration)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title={t.engagement.deviceSplit} meta={t.engagement.hintDevices} className="lg:col-span-2">
          {vm.devices.length === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <>
              {/* One 14px pill, not a chart. Three or four shares add to a
                  whole, and a stacked bar shows "a whole, divided" in a way
                  four separate bars never do. */}
              <div className="flex h-[14px] w-full overflow-hidden rounded-full bg-[#16161A]">
                {vm.devices.map((d, i) => (
                  <span
                    key={d.name}
                    title={`${d.name} · ${fmtPct(d.share)}`}
                    style={{
                      width: `${deviceTotal ? (d.visitors / deviceTotal) * 100 : 0}%`,
                      backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length],
                    }}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {vm.devices.map((d, i) => (
                  <div
                    key={d.name}
                    className="row flex items-baseline justify-between gap-3 px-2 py-1.5 text-[12.5px]"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-[#C9C9D1]">
                      <span
                        aria-hidden="true"
                        className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
                        style={{ backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }}
                      />
                      <span className="truncate">{d.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-white">
                      {fmtCompact(d.visitors)}
                      <span className="ml-2 text-[#5C5C66]">{fmtPct(d.share)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card title={t.engagement.dropOff} meta={t.engagement.hintDropOff}>
        {vm.drop.length === 0 ? (
          <EmptyState message={t.common.noData} />
        ) : (
          <>
            <div className="grid grid-cols-[1fr_80px_180px] gap-3 px-3 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
              <span>{t.common.page}</span>
              <span className="text-right">{t.engagement.views}</span>
              <span className="text-right">{t.engagement.exitRateCol}</span>
            </div>
            {vm.drop.map((r) => (
              <div
                key={r.path}
                className="row grid grid-cols-[1fr_80px_180px] items-center gap-3 px-3 py-2 text-[12.5px]"
              >
                <span className="truncate text-[#C9C9D1]" title={r.path}>
                  {r.path}
                </span>
                <span className="text-right tabular-nums text-[#8A8A93]">{fmtInt(r.views)}</span>
                <span className="flex items-center gap-3">
                  <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#16161A]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.min(r.exitRate, 100)}%`,
                        /* Red only where the exit rate is genuinely bad, so
                           the colour still means something when it appears. */
                        backgroundColor: r.exitRate >= 70 ? '#F06A6A' : CHART.line,
                      }}
                    />
                  </span>
                  <span className="w-[52px] shrink-0 text-right tabular-nums text-white">
                    {fmtPct(r.exitRate)}
                  </span>
                </span>
              </div>
            ))}
          </>
        )}
      </Card>
    </>
  );
}
