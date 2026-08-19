import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Pagination from '../components/Pagination.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { readApiError } from '../api/client.js';
import { bookingsApi, spacesApi } from '../api/endpoints.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatTime } from '../utils/format.js';

const BLANK_FILTERS = { status: 'pending', spaceId: '', date: '' };

export default function AdminBookingsPage() {
  const { toast } = useToast();

  const [filters, setFilters] = useState(BLANK_FILTERS);
  const [page, setPage] = useState(1);
  const [spaces, setSpaces] = useState([]);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    // The filter dropdown needs every space, not just the first page.
    spacesApi
      .list({ limit: 50 })
      .then((data) => setSpaces(data.data))
      .catch(() => setSpaces([]));
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

  const update = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    setPage(1);
  };

  const applyDecision = async () => {
    const { booking, action } = decision;

    if (action === 'approve') {
      const { autoRejected } = await bookingsApi.approve(booking.id);
      setDecision(null);
      toast(
        autoRejected.length > 0
          ? `Approved. ${autoRejected.length} overlapping request${
              autoRejected.length === 1 ? ' was' : 's were'
            } rejected automatically.`
          : 'Booking approved.',
      );
    } else {
      await bookingsApi.reject(booking.id);
      setDecision(null);
      toast('Booking rejected.', 'info');
    }
    setError('');
    await load();
  };

  return (
    <>
      <div className="mb-6">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Administration
        </span>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Booking requests</h1>
        <p className="text-sm text-slate-500">Review and manage workspace booking requests.</p>
      </div>

      <Alert tone="info">
        Approving a request automatically rejects overlapping pending requests for the same space and
        time.
      </Alert>

      <Alert>{error}</Alert>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/50 p-4">
          <select
            aria-label="Filter by status"
            className="field w-auto py-1.5"
            value={filters.status}
            onChange={update('status')}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            aria-label="Filter by space"
            className="field w-auto py-1.5"
            value={filters.spaceId}
            onChange={update('spaceId')}
          >
            <option value="">All spaces</option>
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            aria-label="Filter by date"
            className="field w-auto py-1.5"
            value={filters.date}
            onChange={update('date')}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Space</th>
                <th className="th">Member</th>
                <th className="th hidden sm:table-cell">When</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              {loading ? (
                <tr>
                  <td className="td text-slate-500" colSpan={5}>
                    Loading bookings...
                  </td>
                </tr>
              ) : result.data.length === 0 ? (
                <tr>
                  <td className="td text-slate-500" colSpan={5}>
                    No bookings match those filters.
                  </td>
                </tr>
              ) : (
                result.data.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="td font-medium text-slate-900">{booking.spaceName}</td>
                    <td className="td">
                      <div className="font-medium text-slate-900">{booking.userName}</div>
                      <div className="text-xs text-slate-500">{booking.userEmail}</div>
                    </td>
                    <td className="td hidden text-slate-500 sm:table-cell">
                      <div>{formatDate(booking.startsAt)}</div>
                      <div className="text-xs">
                        {formatTime(booking.startsAt)} - {formatTime(booking.endsAt)}
                      </div>
                    </td>
                    <td className="td">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="td text-right">
                      {booking.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDecision({ booking, action: 'approve' })}
                            className="rounded bg-white px-2 py-1 text-xs font-medium text-emerald-600 ring-1 ring-slate-200 transition-colors hover:bg-emerald-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecision({ booking, action: 'reject' })}
                            className="rounded bg-white px-2 py-1 text-xs font-medium text-rose-600 ring-1 ring-slate-200 transition-colors hover:bg-rose-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Decided</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination pagination={result.pagination} onChange={setPage} noun="booking" />

      {decision && (
        <ConfirmDialog
          title={decision.action === 'approve' ? 'Approve booking?' : 'Reject booking?'}
          tone={decision.action === 'approve' ? 'brand' : 'danger'}
          rows={[
            { label: 'Member', value: decision.booking.userName },
            { label: 'Space', value: decision.booking.spaceName },
            {
              label: 'Time',
              value: `${formatDate(decision.booking.startsAt)}, ${formatTime(
                decision.booking.startsAt,
              )} - ${formatTime(decision.booking.endsAt)}`,
            },
          ]}
          note={
            decision.action === 'approve'
              ? 'Any overlapping pending requests will be rejected automatically.'
              : undefined
          }
          confirmLabel={decision.action === 'approve' ? 'Approve booking' : 'Reject booking'}
          onConfirm={applyDecision}
          onClose={() => setDecision(null)}
        />
      )}
    </>
  );
}
