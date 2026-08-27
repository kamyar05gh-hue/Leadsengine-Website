import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import FallbackNotice from '@/components/FallbackNotice';
import LoadingState from '@/components/LoadingState';
import PageHeader from '@/components/PageHeader';
import StatBox from '@/components/StatBox';
import StatusBar from '@/components/StatusBar';
import { mockDailyLcp, mockExceptions, mockWebVitals } from '@/data/mock';
import {
  fetchDailyLcp,
  fetchExceptions,
  fetchWebVitals,
  type ExceptionsData,
  type LcpPoint,
  type WebVitals,
} from '@/data/posthog';
import { useLang } from '@/i18n/LanguageContext';
import { AXIS_COMMON, CHART, CURSOR_LINE, STATUS } from '@/lib/chart';
import { fmtDay, fmtInt, fmtMs } from '@/lib/format';
import { useLiveQuery } from '@/lib/useLiveQuery';

const DAYS = 30;

interface Vm {
  vitals: WebVitals;
  lcp: LcpPoint[];
  errors: ExceptionsData;
}

function mockVm(): Vm {
  return { vitals: mockWebVitals(), lcp: mockDailyLcp(DAYS), errors: mockExceptions(DAYS) };
}

/**
 * The published Core Web Vitals thresholds, in the units each metric is
 * measured in. `good` is the boundary of the green band and `poor` the start
 * of the red one; anything between is amber.
 *
 * `fill` is the bar's proportion and is deliberately measured against the
 * POOR boundary, not against `good` — a bar that pins at 100% the moment a
 * metric leaves the green band tells you nothing about how far out it is.
 */
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000, unit: 'ms' },
  inp: { good: 200, poor: 500, unit: 'ms' },
  cls: { good: 0.1, poor: 0.25, unit: '' },
  ttfb: { good: 800, poor: 1800, unit: 'ms' },
} as const;

type VitalKey = keyof typeof THRESHOLDS;

export default function Performance({ tick }: { tick: number }) {
  const { t } = useLang();

  const { data, error, loading } = useLiveQuery<Vm>(async () => {
    const [vitals, lcp, errors] = await Promise.all([
      fetchWebVitals(DAYS),
      fetchDailyLcp(DAYS),
      fetchExceptions(DAYS),
    ]);
    return { vitals, lcp, errors };
  }, [tick]);

  if (loading && !data) return <LoadingState />;
  const vm = data ?? mockVm();

  const rate = (key: VitalKey) => {
    const value = vm.vitals[key];
    const th = THRESHOLDS[key];
    if (value === null || !Number.isFinite(value)) {
      return { color: STATUS.muted, label: '–', display: '–', fill: 0 };
    }
    const color = value <= th.good ? STATUS.good : value <= th.poor ? STATUS.warn : STATUS.bad;
    const label =
      value <= th.good ? t.performance.good : value <= th.poor ? t.performance.needsWork : t.performance.poor;
    const display = key === 'cls' ? value.toFixed(3) : fmtMs(value);
    return { color, label, display, fill: value / th.poor };
  };

  const chartData = vm.lcp.map((p) => ({ label: fmtDay(p.date), lcp: p.lcp }));

  const vitalRows: { key: VitalKey; name: string }[] = [
    { key: 'lcp', name: t.performance.lcp },
    { key: 'inp', name: t.performance.inp },
    { key: 'cls', name: t.performance.cls },
    { key: 'ttfb', name: t.performance.ttfb },
  ];

  const lcpState = rate('lcp');

  return (
    <>
      {error && <FallbackNotice message={error.message} />}

      <PageHeader
        kicker={t.performance.kicker}
        title={t.performance.title}
        description={t.performance.desc}
        stats={[
          {
            label: t.performance.lcp,
            value: lcpState.display,
            tone: lcpState.color === STATUS.good ? 'green' : 'red',
            sub: lcpState.label,
          },
          {
            label: t.performance.errors,
            value: fmtInt(vm.errors.total),
            tone: vm.errors.total > 0 ? 'red' : 'green',
            sub: t.performance.hintErrors,
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {vitalRows.map((v) => {
          const s = rate(v.key);
          return <StatBox key={v.key} label={v.name} value={s.display} delta={s.label} />;
        })}
        <StatBox
          label={t.performance.errors}
          value={fmtInt(vm.errors.total)}
          delta={t.performance.hintErrors}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card title={t.performance.lcpTrend} meta={t.performance.hintP75} className="lg:col-span-3">
          {chartData.length === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -8 }}>
                  <CartesianGrid vertical={false} stroke={CHART.grid} />
                  <XAxis dataKey="label" minTickGap={24} {...AXIS_COMMON} />
                  <YAxis width={60} tickFormatter={(v: number) => fmtMs(v)} {...AXIS_COMMON} />
                  <Tooltip
                    contentStyle={CHART.tooltip}
                    labelStyle={CHART.tooltipLabel}
                    cursor={CURSOR_LINE}
                    formatter={(v) => fmtMs(Number(v))}
                  />
                  <Line
                    type="monotone"
                    dataKey="lcp"
                    name={t.performance.lcp}
                    stroke={CHART.line}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Core Web Vitals" meta={t.performance.hintP75} className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            {vitalRows.map((v) => {
              const s = rate(v.key);
              const th = THRESHOLDS[v.key];
              return (
                <StatusBar
                  key={v.key}
                  name={v.name}
                  label={t.performance.hintP75}
                  display={s.display}
                  fill={s.fill}
                  color={s.color}
                  statusLabel={s.label}
                  thresholdHint={
                    v.key === 'cls' ? `≤ ${th.good}` : `≤ ${fmtMs(th.good)}`
                  }
                />
              );
            })}
          </div>
        </Card>
      </div>

      <Card title={t.performance.recent} meta={t.performance.hintErrors}>
        {vm.errors.recent.length === 0 ? (
          <EmptyState message={t.common.noData} />
        ) : (
          <>
            <div className="grid grid-cols-[150px_1fr_80px_150px] gap-3 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
              <span>{t.performance.day}</span>
              <span>{t.performance.message}</span>
              <span className="text-right">{t.performance.count}</span>
              <span className="text-right">{t.performance.severity}</span>
            </div>
            {vm.errors.recent.map((e) => (
              <div
                key={e.message}
                className="row grid grid-cols-[150px_1fr_80px_150px] items-center gap-3 px-3 py-2.5 text-[13px]"
              >
                <span className="tabular-nums text-[#8A8A93]">{fmtDay(e.lastSeen)}</span>
                <span className="truncate text-[#C9C9D1]" title={e.message}>
                  {e.message}
                </span>
                <span className="text-right tabular-nums text-white">{fmtInt(e.count)}</span>
                <span className="flex justify-end">
                  <Badge
                    text={e.count > 10 ? t.performance.sevHigh : t.performance.sevLow}
                    color={e.count > 10 ? STATUS.bad : STATUS.warn}
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
