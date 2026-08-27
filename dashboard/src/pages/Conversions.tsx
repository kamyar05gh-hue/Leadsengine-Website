import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import FallbackNotice from '@/components/FallbackNotice';
import LoadingState from '@/components/LoadingState';
import PageHeader from '@/components/PageHeader';
import StatBox from '@/components/StatBox';
import { mockConversions } from '@/data/mock';
import { fetchConversions, type ConversionStats } from '@/data/posthog';
import { useLang } from '@/i18n/LanguageContext';
import { fmtChf, fmtInt, fmtPct } from '@/lib/format';
import { useLiveQuery } from '@/lib/useLiveQuery';

const DAYS = 30;

/** Average value of one qualified lead, used for the pipeline figure. It is a
 *  business assumption, not a measurement — which is why the card that shows
 *  it states the multiplier on its own line rather than burying it. */
const LEAD_VALUE_CHF = 1800;

export default function Conversions({ tick }: { tick: number }) {
  const { t } = useLang();

  const { data, error, loading } = useLiveQuery<ConversionStats>(
    () => fetchConversions(DAYS),
    [tick],
  );

  if (loading && !data) return <LoadingState />;
  const vm = data ?? mockConversions(DAYS);

  const f = vm.funnel;
  const steps = [
    { label: t.conversions.steps[0], value: f.sessions },
    { label: t.conversions.steps[1], value: f.engaged },
    { label: t.conversions.steps[2], value: f.cta },
    { label: t.conversions.steps[3], value: f.demo },
  ];
  const top = steps[0]?.value || 0;

  const goals = [
    {
      name: t.conversions.primaryGoal,
      clicks: vm.primaryClicks,
      sessions: vm.primarySessions,
    },
    {
      name: t.conversions.widgetGoal,
      clicks: vm.widgetClicks,
      sessions: vm.widgetSessions,
    },
  ];

  const pipeline = vm.convSessions * LEAD_VALUE_CHF;

  return (
    <>
      {error && <FallbackNotice message={error.message} />}

      <PageHeader
        kicker={t.conversions.kicker}
        title={t.conversions.title}
        description={t.conversions.desc}
        stats={[
          { label: t.overview.conversions, value: fmtInt(vm.convSessions), tone: 'green' },
          { label: t.overview.convRate, value: fmtPct(vm.convRate, 2) },
          { label: t.conversions.leadValue, value: fmtChf(pipeline) },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatBox label={t.traffic.sessions} value={fmtInt(vm.totalSessions)} />
        <StatBox
          label={t.overview.conversions}
          value={fmtInt(vm.convSessions)}
          delta={t.overview.hintConv}
        />
        <StatBox label={t.overview.convRate} value={fmtPct(vm.convRate, 2)} />
        <StatBox
          label={t.conversions.clicks}
          value={fmtInt(vm.primaryClicks + vm.widgetClicks)}
          delta={t.conversions.hintGoals}
        />
        <StatBox
          label={t.conversions.leadValue}
          value={fmtChf(pipeline)}
          delta={t.conversions.leadValueHint}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card title={t.conversions.funnel} meta={t.conversions.hintFunnel} className="lg:col-span-3">
          {top === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <div className="flex flex-col gap-4">
              {steps.map((s, i) => {
                const pctOfTop = top ? (s.value / top) * 100 : 0;
                return (
                  <div key={s.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] text-[#C9C9D1]">{s.label}</span>
                      <span className="text-[13px] tabular-nums text-white">
                        {fmtInt(s.value)}
                        <span className="ml-2 text-[#5C5C66]">{fmtPct(pctOfTop)}</span>
                      </span>
                    </div>
                    {/* One hue, fading down the funnel. Four different colours
                        would imply four unrelated categories; this is one
                        population getting smaller. */}
                    <div className="mt-2 h-[26px] overflow-hidden rounded-[6px] bg-[#0E0E11]">
                      <div
                        className="h-full rounded-[6px]"
                        style={{
                          width: `${pctOfTop}%`,
                          backgroundColor: `rgba(91,141,239,${(1 - i * 0.18).toFixed(2)})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title={t.conversions.leadValue} meta={t.common.period} className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            {[
              {
                label: t.overview.conversions,
                value: fmtInt(vm.convSessions),
                sub: t.overview.hintConv,
              },
              {
                label: t.conversions.rate,
                value: fmtPct(vm.convRate, 2),
                sub: `${fmtInt(vm.convSessions)} / ${fmtInt(vm.totalSessions)} ${t.conversions.ofSessions}`,
              },
              {
                label: t.conversions.leadValue,
                value: fmtChf(pipeline),
                sub: t.conversions.leadValueHint,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-[10px] border border-[#16161A] bg-[#0E0E11] px-4 py-3.5"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
                  {row.label}
                </div>
                <div className="mt-2 text-[22px] font-medium tabular-nums text-white">
                  {row.value}
                </div>
                <div className="mt-1 text-[11px] leading-relaxed text-[#5C5C66]">{row.sub}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title={t.conversions.goals} meta={t.conversions.hintGoals}>
        <div className="grid grid-cols-[1fr_120px_1fr] gap-3 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
          <span>{t.conversions.goal}</span>
          <span className="text-right">{t.conversions.clicks}</span>
          <span className="text-right">{t.conversions.uniques}</span>
        </div>
        {goals.map((g) => (
          <div
            key={g.name}
            className="row grid grid-cols-[1fr_120px_1fr] items-center gap-3 px-3 py-2.5 text-[13px]"
          >
            <span className="truncate text-[#C9C9D1]" title={g.name}>
              {g.name}
            </span>
            <span className="text-right tabular-nums text-white">{fmtInt(g.clicks)}</span>
            <span className="text-right tabular-nums text-[#8A8A93]">{fmtInt(g.sessions)}</span>
          </div>
        ))}
      </Card>
    </>
  );
}
