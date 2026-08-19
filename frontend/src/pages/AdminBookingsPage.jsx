import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { readApiError } from '../api/client.js';
import { bookingsApi, spacesApi } from '../api/endpoints.js';
import { formatDateTime, formatTime } from '../utils/format.js';

const BLANK_FILTERS = { status: 'pending', spaceId: '', date: '' };

export default function AdminBookingsPage() {
  const [filters, setFilters] = useState(BLANK_FILTERS);
  const [page, setPage] = useState(1);
  const [spaces, setSpaces] = useState([]);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    // The filter dropdown needs every space, not just the first page.
    spacesApi.list({ limit: 50 }).then((data) => setSpaces(data.data)).catch(() => setSpaces([]));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.spaceId) params.spaceId = filters.spaceId;
    if (filters.date) params.date = filters.date;

    return bookingsApi
      .all(params)
      .then(setResult)
      .catch((err) => setError(readApiError(err, 'Could not load bookings')))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (booking, action) => {
    setBusyId(booking.id);
    setError('');
    setMessage('');

    try {
      if (action === 'approve') {
        const { autoRejected } = await bookingsApi.approve(booking.id);
        setMessage(
          autoRejected.length > 0
            ? `Approved. ${autoRejected.length} overlapping request(s) were rejected automatically.`
            : 'Booking approved.',
        );
      } else {
        await bookingsApi.reject(booking.id);
        setMessage('Booking rejected.');
      }
      await load();
    } catch (err) {
      setError(readApiError(err, 'Could not update that booking'));
    } finally {
      setBusyId(null);
    }
  };

  const update = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Booking requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Approving a request automatically rejects any other pending request that overlaps it.
        </p>
      </div>

      <div className="card grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
        <div>
          <label className="label" htmlFor="filter-status">
            Status
          </label>
          <select id="filter-status" className="field" value={filters.status} onChange={update('status')}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-space">
            Space
          </label>
          <select id="filter-space" className="field" value={filters.spaceId} onChange={update('spaceId')}>
            <option value="">All spaces</option>
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-date">
            Date
          </label>
          <input
            id="filter-date"
            type="date"
            className="field"
            value={filters.date}
            onChange={update('date')}
          />
        </div>
      </div>

      <Alert>{error}</Alert>
      <Alert tone="success">{message}</Alert>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading bookings...</p>
      ) : result.data.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-medium text-slate-700">No bookings match those filters</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Space</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.data.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{booking.spaceName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="block">{booking.userName}</span>
                    <span className="text-xs text-slate-400">{booking.userEmail}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDateTime(booking.startsAt)} - {formatTime(booking.endsAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {booking.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            className="btn-success px-3 py-1.5"
                            disabled={busyId === booking.id}
                            onClick={() => decide(booking, 'approve')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn-danger px-3 py-1.5"
                            disabled={busyId === booking.id}
                            onClick={() => decide(booking, 'reject')}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Decided</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={result.pagination} onChange={setPage} />
    </div>
  );
}
