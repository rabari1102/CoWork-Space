import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { readApiError } from '../api/client.js';
import { bookingsApi } from '../api/endpoints.js';
import { formatDateTime, formatTime, SPACE_TYPE_LABELS } from '../utils/format.js';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

export default function MemberDashboard() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return bookingsApi
      .mine({ page, limit: 10, ...(status === 'all' ? {} : { status }) })
      .then(setResult)
      .catch((err) => setError(readApiError(err, 'Could not load your bookings')))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (booking) => {
    setBusyId(booking.id);
    setError('');
    setMessage('');
    try {
      await bookingsApi.cancel(booking.id);
      setMessage(`Booking for ${booking.spaceName} was cancelled.`);
      await load();
    } catch (err) {
      setError(readApiError(err, 'Could not cancel that booking'));
    } finally {
      setBusyId(null);
    }
  };

  // The API only allows cancelling a future booking that is still live.
  const isCancellable = (booking) =>
    ['pending', 'approved'].includes(booking.status) && new Date(booking.startsAt) > new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My bookings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track the status of every request and cancel the ones you no longer need.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
              status === tab
                ? 'bg-brand-600 text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Alert>{error}</Alert>
      <Alert tone="success">{message}</Alert>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading bookings...</p>
      ) : result.data.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-medium text-slate-700">Nothing here yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Pick a space and request a slot to get started.
          </p>
          <Link to="/" className="btn-primary mt-4">
            Browse spaces
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {result.data.map((booking) => (
            <li key={booking.id} className="card flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="min-w-[200px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">{booking.spaceName}</h2>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {SPACE_TYPE_LABELS[booking.spaceType]} &middot; {formatDateTime(booking.startsAt)} -{' '}
                  {formatTime(booking.endsAt)}
                </p>
              </div>

              {isCancellable(booking) ? (
                <button
                  type="button"
                  className="btn-danger"
                  disabled={busyId === booking.id}
                  onClick={() => cancel(booking)}
                >
                  {busyId === booking.id ? 'Cancelling...' : 'Cancel'}
                </button>
              ) : (
                <span className="text-xs text-slate-400">No action available</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Pagination pagination={result.pagination} onChange={setPage} />
    </div>
  );
}
