import { Gauge, LayoutDashboard, MousePointerClick, Target, TrendingUp, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { PAGE_IDS, type PageId } from '@/lib/types';
import LanguageDropdown from './LanguageDropdown';

const ICONS: Record<PageId, LucideIcon> = {
  overview: LayoutDashboard,
  traffic: TrendingUp,
  engagement: MousePointerClick,
  conversions: Target,
  performance: Gauge,
  audience: Users,
};

/**
 * Fixed 250px column: identity, language, nav, live status.
 *
 * BELOW md IT BECOMES A TOP BAR. A 250px column on a 390px phone leaves the
 * dashboard 140px, which is not a layout. Every token, icon and label is the
 * same in both; only the axis changes, and at md and up the rendering is the
 * fixed column exactly as specified.
 */
export default function Sidebar({
  page,
  onNavigate,
  lastUpdated,
}: {
  page: PageId;
  onNavigate: (p: PageId) => void;
  lastUpdated: Date;
}) {
  const { t } = useLang();

  return (
    <aside
      className="shrink-0 border-[#1C1C21] bg-black
        max-md:w-full max-md:border-b max-md:px-4 max-md:py-4
        md:flex md:h-screen md:w-[228px] md:flex-col md:overflow-y-auto md:border-r md:px-4 md:py-5"
    >
      <div className="px-2">
        <div className="text-[14px] font-semibold text-white">Leads Engine</div>
        <div className="mt-0.5 text-[11px] text-[#5C5C66]">leadsengine.ch · Website analytics</div>
      </div>

      <div className="mt-5 px-2 max-md:max-w-[220px]">
        <LanguageDropdown />
      </div>

      <div className="mt-8 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C5C66] max-md:mt-6">
        {t.common.analytics}
      </div>

      <nav className="mt-3 flex gap-1 max-md:overflow-x-auto max-md:pb-1 md:flex-col">
        {PAGE_IDS.map((id) => {
          const Icon = ICONS[id];
          return (
            <button
              key={id}
              type="button"
              className="navitem"
              data-active={page === id}
              onClick={() => onNavigate(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={16} strokeWidth={1.5} className="shrink-0 text-[#6B6B76]" />
              <span>{t.nav[id]}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-2 max-md:mt-4 md:mt-auto">
        <div className="flex items-center gap-2 text-[11px] text-[#8A8A93]">
          <span className="pulse-dot inline-block h-[6px] w-[6px] rounded-full bg-[#3ECF8E]" />
          {t.common.liveRefresh}
        </div>
        <div className="mt-1.5 text-[10px] text-[#3F3F47]">
          {t.common.lastUpdated} {lastUpdated.toLocaleTimeString('de-CH', { hour12: false })}
        </div>
      </div>
    </aside>
  );
}
