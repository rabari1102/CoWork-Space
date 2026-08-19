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

const PAGE_SIZE = 9;
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
      .list({ limit: 50 })
      .then((data) => setInventory(data.data))
      .catch(() => setInventory([]));
  }, []);

  const stats = useMemo(() => {
    const desks = inventory.filter((s) => s.type === 'desk').length;
    const rooms = inventory.filter((s) => s.type === 'meeting_room').length;
    const largest = inventory.reduce((max, s) => Math.max(max, s.capacity), 0);
    const amenities = new Set(inventory.flatMap((s) => s.amenities));
    return { total: inventory.length, desks, rooms, largest, amenities: amenities.size };
  }, [inventory]);

  const categories = useMemo(
    () => [
      { label: 'Hot desks', icon: 'ph-desktop', tint: 'from-brand-500 to-cyan-500', query: { type: 'desk' }, count: stats.desks },
      { label: 'Meeting rooms', icon: 'ph-door', tint: 'from-cyan-500 to-blue-600', query: { type: 'meeting_room' }, count: stats.rooms },
      { label: 'Team spaces', icon: 'ph-users-three', tint: 'from-violet-500 to-fuchsia-500', query: { minCapacity: '6' }, count: inventory.filter((s) => s.capacity >= 6).length },
      { label: 'Large rooms', icon: 'ph-projector-screen', tint: 'from-navy-700 to-brand-600', query: { minCapacity: '10' }, count: inventory.filter((s) => s.capacity >= 10).length },
    ],
    [stats, inventory],
  );

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
      <Hero stats={stats} onSearch={apply} />

      <div className="page relative z-10">
        {/* Real inventory numbers, counted from the API rather than invented. */}
        <Reveal>
          <dl className="mt-8 mb-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { label: 'Workspaces', value: stats.total, icon: 'ph-buildings' },
              { label: 'Hot desks', value: stats.desks, icon: 'ph-desktop' },
              { label: 'Meeting rooms', value: stats.rooms, icon: 'ph-door' },
              { label: 'Amenities offered', value: stats.amenities, icon: 'ph-sparkle' },
            ].map((stat) => (
              <div key={stat.label} className="card p-5">
                <i className={`ph ${stat.icon} text-xl text-brand-500`} />
                <dd className="mt-2 text-3xl font-extrabold tracking-tight text-navy-900">
                  <CountUp value={stat.value} />
                </dd>
                <dt className="mt-0.5 text-[13px] text-slate-500">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Categories */}
        <section className="mt-20">
          <Reveal>
            <p className="eyebrow">Browse by type</p>
            <h2 className="mt-3 text-section font-extrabold text-navy-900">
              Every kind of space you need
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Reveal key={category.label} delay={index * 70}>
                <button
                  type="button"
                  onClick={() => apply({ ...EMPTY_FILTERS, ...category.query })}
                  className="group relative h-full w-full overflow-hidden rounded-3xl p-6 text-left ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.tint} opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.14]`}
                  />
                  <div className="relative">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${category.tint} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      <i className={`ph ${category.icon} text-2xl`} />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-navy-900">{category.label}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {category.count} {category.count === 1 ? 'space' : 'spaces'}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                      Browse
                      <i className="ph ph-arrow-right transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-24">
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

        {/* Listing */}
        <section ref={listRef} className="mt-24 scroll-mt-24">
          <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">All workspaces</p>
              <h2 className="mt-3 text-section font-extrabold text-navy-900">
                {isFiltered ? 'Matching your search' : 'Browse every space'}
              </h2>
            </div>
            {result.pagination && !loading && (
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-navy-900">{result.pagination.total}</span>{' '}
                {result.pagination.total === 1 ? 'space' : 'spaces'} found
              </p>
            )}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((space, index) => (
                <Reveal key={space.id} delay={Math.min(index, 5) * 60}>
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
