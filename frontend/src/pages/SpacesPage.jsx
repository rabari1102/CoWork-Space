import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import SpaceCard from '../components/SpaceCard.jsx';
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

/** Only send filters the user actually filled in. */
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

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    spacesApi
      .list(toParams(filters, page))
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) setError(readApiError(err, 'Could not load spaces'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const goToPage = (next) => setSearchParams(next > 1 ? { page: String(next) } : {});

  const apply = (next) => {
    setFilters(next);
    goToPage(1);
  };

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="eyebrow">Workspaces</span>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Find your next workspace</h1>
          <p className="mt-1 text-slate-500">
            Discover desks and meeting rooms that fit the way you work.
          </p>
        </div>
        {result.pagination && (
          <p className="hidden text-sm text-slate-500 md:block">{result.pagination.total} results</p>
        )}
      </div>

      <SpaceFilters value={filters} onApply={apply} onReset={() => apply(EMPTY_FILTERS)} />

      <Alert>{error}</Alert>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" />
          ))}
        </div>
      ) : result.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <i className="ph ph-magnifying-glass text-2xl text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No spaces match those filters</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try widening the time range or clearing the search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.data.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}

      <Pagination pagination={result.pagination} onChange={goToPage} noun="space" />
    </>
  );
}
