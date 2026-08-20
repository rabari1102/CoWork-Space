import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import CountUp from '../components/CountUp.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Hero from '../components/Hero.jsx';
import Pagination from '../components/Pagination.jsx';
import Reveal from '../components/Reveal.jsx';
import SpaceCard, { SpaceCardSkeleton, availabilityLabel } from '../components/SpaceCard.jsx';
import SpaceFilters from '../components/SpaceFilters.jsx';
import { readApiError } from '../api/client.js';
import { spacesApi } from '../api/endpoints.js';

const EMPTY_FILTERS = {
  search: '',
  type: '',
  minCapacity: '',
  date: '',
  startTime: '',
  endTime: '',
};

const PAGE_SIZE = 12;
const FILTER_KEYS = Object.keys(EMPTY_FILTERS);

const STEPS = [
  { n: '01', title: 'Discover', body: 'Search by name or type and see what is free on the day you need.', icon: 'ph-magnifying-glass' },
  { n: '02', title: 'Book', body: 'Pick a date and a time slot. Overlapping slots are refused outright.', icon: 'ph-calendar-plus' },
  { n: '03', title: 'Work', body: 'An admin approves the request and the space is yours for the slot.', icon: 'ph-check-circle' },
];

/** Filters live in the URL so a search can be shared, bookmarked and gone back to. */
function readFilters(params) {
  const filters = { ...EMPTY_FILTERS };
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) filters[key] = value;
  }
  return filters;
}

function toParams(filters, page) {
  const params = { page, limit: PAGE_SIZE };
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') params[key] = value;
  }
  return params;
}

export default function SpacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    spacesApi
      .list(toParams(filters, page))
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(readApiError(err, 'Could not load spaces')))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  // One unfiltered read backs the counters and the category tiles. The venue has
  // tens of spaces rather than thousands, so a single page covers the inventory.
  useEffect(() => {
    spacesApi
      .summary()
      .then((data) => {
        setSummary(data);
        setInventory(data.spaces);
      })
      .catch(() => setInventory([]));
  }, []);

  const stats = useMemo(() => {
    if (summary) {
      return {
        total: summary.total,
        desks: summary.desks,
        rooms: summary.rooms,
        largest: summary.largest,
        totalCapacity: summary.totalCapacity,
        amenities: 0,
      };
    }
    const desks = inventory.filter((s) => s.type === 'desk').length;
    const rooms = inventory.filter((s) => s.type === 'meeting_room').length;
    const largest = inventory.reduce((max, s) => Math.max(max, s.capacity), 0);
    const totalCapacity = inventory.reduce((sum, s) => sum + s.capacity, 0);
    return {
      total: inventory.length,
      desks,
      rooms,
      largest,
      totalCapacity,
      amenities: 0,
    };
  }, [inventory, summary]);

  const apply = (next, { scroll = true } = {}) => {
    const params = {};
    for (const [key, value] of Object.entries(next)) {
      if (value !== '') params[key] = value;
    }
    setSearchParams(params);
    if (scroll) {
      requestAnimationFrame(() =>
        listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    }
  };

  const goToPage = (next) => {
    const params = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '') params[key] = value;
    }
    if (next > 1) params.page = String(next);
    setSearchParams(params);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const badge = availabilityLabel(filters.date, filters.startTime, filters.endTime);
  const isFiltered = FILTER_KEYS.some((key) => filters[key] !== '');

  return (
    <>
      <Hero stats={stats} inventory={inventory} onSearch={apply} />

      <div className="page relative z-10">
        {/* How it works */}
        <section className="mt-8 sm:mt-12 mb-16 sm:mb-20">
          <Reveal className="text-center">
            <p className="eyebrow justify-center">How it works</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-section font-extrabold text-navy-900">
              From search to seat in three steps
            </h2>
          </Reveal>

          <div className="relative mt-12 grid gap-8 md:grid-cols-3">
            <div
              className="gradient-rule absolute left-0 right-0 top-7 hidden h-px md:block"
              aria-hidden="true"
            />
            {STEPS.map((step, index) => (
              <Reveal key={step.n} delay={index * 130} className="relative text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-card ring-1 ring-slate-200">
                  <i className={`ph ${step.icon} text-2xl`} />
                </span>
                <p className="mt-5 text-[11px] font-bold tracking-[0.2em] text-slate-400">{step.n}</p>
                <h3 className="mt-1.5 text-xl font-bold text-navy-900">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Workspace Catalog / Explore Inventory */}
        <section ref={listRef} className="scroll-mt-24">
          <Reveal className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Explore Inventory</p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                {isFiltered ? 'Matching Workspaces' : 'All Workspaces'}
              </h2>
            </div>

            {/* Quick Type Filter Tabs */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => apply({ ...filters, type: '', page: '' })}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  filters.type === ''
                    ? 'bg-white text-navy-900 shadow-sm ring-1 ring-slate-200/60'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                All ({stats.total || 50})
              </button>
              <button
                type="button"
                onClick={() => apply({ ...filters, type: 'desk', page: '' })}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  filters.type === 'desk'
                    ? 'bg-white text-navy-900 shadow-sm ring-1 ring-slate-200/60'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                Desks ({stats.desks || 24})
              </button>
              <button
                type="button"
                onClick={() => apply({ ...filters, type: 'meeting_room', page: '' })}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  filters.type === 'meeting_room'
                    ? 'bg-white text-navy-900 shadow-sm ring-1 ring-slate-200/60'
                    : 'text-slate-500 hover:text-navy-900'
                }`}
              >
                Meeting Rooms ({stats.rooms || 26})
              </button>
            </div>
          </Reveal>

          <SpaceFilters
            value={filters}
            onApply={(next) => apply(next, { scroll: false })}
            onReset={() => apply(EMPTY_FILTERS, { scroll: false })}
          />

          {error && (
            <div className="mb-6">
              <Alert>{error}</Alert>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <SpaceCardSkeleton key={index} />
              ))}
            </div>
          ) : result.data.length === 0 ? (
            <EmptyState
              icon="ph-magnifying-glass"
              title="We couldn't find a workspace matching that"
              description="Try widening the time range, lowering the capacity, or clearing the search."
              actionLabel="Clear filters"
              onAction={() => apply(EMPTY_FILTERS, { scroll: false })}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.data.map((space, index) => (
                <Reveal key={space.id} delay={Math.min(index, 7) * 45}>
                  <SpaceCard space={space} availableOn={badge} />
                </Reveal>
              ))}
            </div>
          )}

          <Pagination pagination={result.pagination} onChange={goToPage} noun="space" />
        </section>
      </div>
    </>
  );
}
