import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import {
  mockActiveNow,
  mockBrowsers,
  mockCities,
  mockCountries,
  mockDeviceSplit,
  mockOs,
} from '@/data/mock';
import {
  fetchActiveNow,
  fetchBrowsers,
  fetchCities,
  fetchCountries,
  fetchDeviceSplit,
  fetchOs,
  type ShareRow,
} from '@/data/posthog';
import { useLang } from '@/i18n/LanguageContext';
import { AXIS_COMMON, CHART, CURSOR_BAR, STATUS } from '@/lib/chart';
import { fmtCompact, fmtInt, fmtPct } from '@/lib/format';
import { useLiveQuery } from '@/lib/useLiveQuery';

const DAYS = 30;

interface Vm {
  countries: ShareRow[];
  cities: ShareRow[];
  devices: ShareRow[];
  os: ShareRow[];
  browsers: ShareRow[];
  active: number;
}

function mockVm(): Vm {
  return {
    countries: mockCountries(DAYS),
    cities: mockCities(DAYS),
    devices: mockDeviceSplit(DAYS),
    os: mockOs(DAYS),
    browsers: mockBrowsers(DAYS),
    active: mockActiveNow().active,
  };
}

/** Three bands, by share of total traffic. The point is to separate "this is
 *  where the business already is" from "this is where it might go next" —
 *  a flat ranking hides that distinction entirely. */
function tierOf(share: number) {
  if (share >= 20) return 'core' as const;
  if (share >= 7) return 'growing' as const;
  return 'emerging' as const;
}

const TIER_COLOR = {
  core: CHART.line,
  growing: CHART.line2,
  emerging: '#8A8A93',
} as const;

export default function Audience({ tick }: { tick: number }) {
  const { t } = useLang();

  const { data, error, loading } = useLiveQuery<Vm>(async () => {
    const [countries, cities, devices, os, browsers, active] = await Promise.all([
      fetchCountries(DAYS),
      fetchCities(DAYS),
      fetchDeviceSplit(DAYS),
      fetchOs(DAYS),
      fetchBrowsers(DAYS),
      fetchActiveNow(),
    ]);
    return { countries, cities, devices, os, browsers, active: active.active };
  }, [tick]);

  if (loading && !data) return <LoadingState />;
  const vm = data ?? mockVm();

  const tierLabel = {
    core: t.audience.tierCore,
    growing: t.audience.tierGrowing,
    emerging: t.audience.tierEmerging,
  } as const;

  const geo = vm.cities.slice(0, 10);
  const geoData = geo.map((r) => ({
    name: r.name,
    visitors: r.visitors,
    fill: TIER_COLOR[tierOf(r.share)],
  }));

  const totalVisitors = vm.countries.reduce((n, r) => n + r.visitors, 0);
  const topCountry = vm.countries[0];
  const topDevice = vm.devices[0];

  /** A compact "name — count — share" list, used for both OS and browsers. */
  const shareList = (rows: ShareRow[]) => (
    <div className="flex flex-col gap-2">
      {rows.slice(0, 6).map((r) => (
        <div
          key={r.name}
          className="row flex items-baseline justify-between gap-3 px-2 py-1.5 text-[13px]"
        >
          <span className="min-w-0 truncate text-[#C9C9D1]" title={r.name}>
            {r.name}
          </span>
          <span className="shrink-0 tabular-nums text-white">
            {fmtCompact(r.visitors)}
            <span className="ml-2 text-[#5C5C66]">{fmtPct(r.share)}</span>
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {error && <FallbackNotice message={error.message} />}

      <PageHeader
        kicker={t.audience.kicker}
        title={t.audience.title}
        description={t.audience.desc}
        stats={[
          { label: t.overview.activeNow, value: fmtInt(vm.active), tone: 'green' },
          { label: t.audience.visitors, value: fmtCompact(totalVisitors) },
          {
            label: t.audience.countries,
            value: topCountry ? topCountry.name : '–',
            sub: topCountry ? fmtPct(topCountry.share) : undefined,
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatBox label={t.audience.visitors} value={fmtInt(totalVisitors)} />
        <StatBox
          label={t.overview.activeNow}
          value={fmtInt(vm.active)}
          delta={t.overview.hintActive}
        />
        <StatBox
          label={t.audience.countries}
          value={fmtInt(vm.countries.length)}
          delta={topCountry?.name}
        />
        <StatBox label={t.audience.cities} value={fmtInt(vm.cities.length)} />
        <StatBox
          label={t.audience.devices}
          value={topDevice ? topDevice.name : '–'}
          delta={topDevice ? fmtPct(topDevice.share) : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card title={t.audience.cities} meta={t.audience.hintGeo} className="lg:col-span-3">
          {geoData.length === 0 ? (
            <EmptyState message={t.common.noData} />
          ) : (
            <div style={{ height: Math.max(240, geoData.length * 30) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={geoData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke={CHART.grid} />
                  <XAxis type="number" tickFormatter={fmtCompact} {...AXIS_COMMON} />
                  <YAxis type="category" dataKey="name" width={120} {...AXIS_COMMON} />
                  <Tooltip
                    contentStyle={CHART.tooltip}
                    labelStyle={CHART.tooltipLabel}
                    cursor={CURSOR_BAR}
                  />
                  <Bar dataKey="visitors" name={t.audience.visitors} radius={[0, 4, 4, 0]}>
                    {geoData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card title={t.audience.os} meta={t.audience.share}>
            {vm.os.length === 0 ? (
              <span className="text-[13px] text-[#5C5C66]">{t.common.noData}</span>
            ) : (
              shareList(vm.os)
            )}
          </Card>
          <Card title={t.audience.browsers} meta={t.audience.share}>
            {vm.browsers.length === 0 ? (
              <span className="text-[13px] text-[#5C5C66]">{t.common.noData}</span>
            ) : (
              shareList(vm.browsers)
            )}
          </Card>
        </div>
      </div>

      <Card title={t.audience.countries} meta={t.audience.hintTier}>
        {vm.countries.length === 0 ? (
          <EmptyState message={t.common.noData} />
        ) : (
          <>
            <div className="grid grid-cols-[1fr_90px_90px_120px] gap-3 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B6B76]">
              <span>{t.audience.region}</span>
              <span className="text-right">{t.audience.visitors}</span>
              <span className="text-right">{t.audience.share}</span>
              <span className="text-right">{t.audience.tier}</span>
            </div>
            {vm.countries.map((r) => {
              const tier = tierOf(r.share);
              return (
                <div
                  key={r.name}
                  className="row grid grid-cols-[1fr_90px_90px_120px] items-center gap-3 px-3 py-2.5 text-[13px]"
                >
                  <span className="truncate text-[#C9C9D1]" title={r.name}>
                    {r.name}
                  </span>
                  <span className="text-right tabular-nums text-white">{fmtInt(r.visitors)}</span>
                  <span className="text-right tabular-nums text-[#8A8A93]">{fmtPct(r.share)}</span>
                  <span className="flex justify-end">
                    <Badge
                      text={tierLabel[tier]}
                      color={tier === 'core' ? STATUS.good : TIER_COLOR[tier]}
                    />
                  </span>
                </div>
              );
            })}
          </>
        )}
      </Card>
    </>
  );
}
