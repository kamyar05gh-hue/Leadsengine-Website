import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Overview from '@/pages/Overview';
import Traffic from '@/pages/Traffic';
import Engagement from '@/pages/Engagement';
import Conversions from '@/pages/Conversions';
import Performance from '@/pages/Performance';
import Audience from '@/pages/Audience';
import { PAGE_IDS, type PageId } from '@/lib/types';

/** Every page re-queries when this ticks. 30 s is well under the shortest
 *  thing anyone watches here and well over PostHog's query cost. */
const REFRESH_MS = 30_000;

function initialPage(): PageId {
  const hash = window.location.hash.replace('#', '');
  return (PAGE_IDS as readonly string[]).includes(hash) ? (hash as PageId) : 'overview';
}

export default function App() {
  const [page, setPage] = useState<PageId>(initialPage);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  /* ONE counter, threaded into every page's useLiveQuery deps. The pages do
     not own timers; if they did, six pages would drift apart and a page
     mounted late would refresh on its own schedule. */
  const [tick, setTick] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const id = window.setInterval(() => {
      setLastUpdated(new Date());
      setTick((n) => n + 1);
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  /* Deep-linkable, and survives a reload. replaceState rather than pushState:
     the six pages are tabs, not a history the back button should walk. */
  useEffect(() => {
    window.history.replaceState(null, '', `#${page}`);
  }, [page]);

  const go = (p: PageId) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app-scope flex min-h-screen max-md:flex-col">
      <Sidebar page={page} onNavigate={go} lastUpdated={lastUpdated} />
      <main className="min-w-0 flex-1 px-7 py-5 max-md:px-4">
        <div className="mx-auto max-w-[1440px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-4"
            >
              {page === 'overview' && <Overview onNavigate={go} tick={tick} />}
              {page === 'traffic' && <Traffic tick={tick} />}
              {page === 'engagement' && <Engagement tick={tick} />}
              {page === 'conversions' && <Conversions tick={tick} />}
              {page === 'performance' && <Performance tick={tick} />}
              {page === 'audience' && <Audience tick={tick} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
