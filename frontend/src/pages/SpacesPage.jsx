import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import SpaceCard from '../components/SpaceCard.jsx';
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

/** Only send filters the user actually filled in. */
function toParams(filters, page) {
  const params = { page, limit: 9 };
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') params[key] = value;
  }
  return params;
}

export default function SpacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    spacesApi
      .list(toParams(applied, page))
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
  }, [applied, page]);

  const updateField = (field) => (event) =>
    setFilters((current) => ({ ...current, [field]: event.target.value }));

  const goToPage = (next) => {
    setSearchParams(next > 1 ? { page: String(next) } : {});
  };

  const submit = (event) => {
    event.preventDefault();
    // Times only make sense together with a date, so drop them if there is none.
    const next = filters.date ? filters : { ...filters, startTime: '', endTime: '' };
    setFilters(next);
    setApplied(next);
    goToPage(1);
  };

  const reset = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    goToPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Find a space</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse every desk and meeting room, then check what is free on the day you need.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="label" htmlFor="search">
              Search by name or type
            </label>
            <input
              id="search"
              className="field"
              placeholder="Boardroom, desk, studio..."
              value={filters.search}
              onChange={updateField('search')}
            />
          </div>

          <div>
            <label className="label" htmlFor="type">
              Space type
            </label>
            <select id="type" className="field" value={filters.type} onChange={updateField('type')}>
              <option value="">Any type</option>
              <option value="desk">Desk</option>
              <option value="meeting_room">Meeting room</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="minCapacity">
              Minimum capacity
            </label>
            <input
              id="minCapacity"
              type="number"
              min="1"
              className="field"
              placeholder="Any"
              value={filters.minCapacity}
              onChange={updateField('minCapacity')}
            />
          </div>

          <div>
            <label className="label" htmlFor="date">
              Available on
            </label>
            <input
              id="date"
              type="date"
              className="field"
              value={filters.date}
              onChange={updateField('date')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="startTime">
                From
              </label>
              <input
                id="startTime"
                type="time"
                className="field"
                disabled={!filters.date}
                value={filters.startTime}
                onChange={updateField('startTime')}
              />
            </div>
            <div>
              <label className="label" htmlFor="endTime">
                To
              </label>
              <input
                id="endTime"
                type="time"
                className="field"
                disabled={!filters.date}
                value={filters.endTime}
                onChange={updateField('endTime')}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">
            Apply filters
          </button>
          <button type="button" className="btn-secondary" onClick={reset}>
            Clear
          </button>
        </div>
      </form>

      <Alert>{error}</Alert>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading spaces...</p>
      ) : result.data.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-medium text-slate-700">No spaces match those filters</p>
          <p className="mt-1 text-sm text-slate-500">Try widening the time range or clearing the search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}

      <Pagination pagination={result.pagination} onChange={goToPage} />
    </div>
  );
}
