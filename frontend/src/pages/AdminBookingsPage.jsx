import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DatePicker from '../components/DatePicker.jsx';
import Pagination from '../components/Pagination.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { readApiError } from '../api/client.js';
import { bookingsApi, spacesApi } from '../api/endpoints.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatTime, SPACE_TYPE_ICONS } from '../utils/format.js';

const BLANK_FILTERS = { status: 'all', spaceId: '', date: '' };

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending Only' },
  { value: 'approved', label: 'Approved Only' },
  { value: 'rejected', label: 'Rejected Only' },
  { value: 'cancelled', label: 'Cancelled Only' },
];

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
    spacesApi
      .summary()
      .then((data) => setSpaces(data.spaces))
      .catch(() => setSpaces([]));
  }, []);

  const load = useCallback((showSpinner = true) => {
    if (showSpinner) setLoading(true);
    const params = { page, limit: 10 };
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.spaceId) params.spaceId = filters.spaceId;
    if (filters.date) params.date = filters.date;

    return bookingsApi
      .all(params)
      .then(setResult)
      .catch((err) => setError(readApiError(err, 'Could not load bookings')))
      .finally(() => {
        if (showSpinner) setLoading(false);
      });
  }, [page, filters]);

  useEffect(() => {
    load(true);
  }, [load]);

  const setFilter = (field) => (value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const applyDecision = async () => {
    const { booking, action } = decision;

    // Optimistic inline update: immediately reflect state in table without page flicker
    const targetStatus = action === 'approve' ? 'approved' : 'rejected';
    setResult((prev) => ({
      ...prev,
      data: prev.data.map((b) => (b.id === booking.id ? { ...b, status: targetStatus } : b)),
    }));

    if (action === 'approve') {
      const { autoRejected } = await bookingsApi.approve(booking.id);
      setDecision(null);
      toast(
        autoRejected.length > 0
          ? `Approved. ${autoRejected.length} overlapping request${
              autoRejected.length === 1 ? ' was' : 's were'
            } rejected automatically.`
          : 'Booking approved successfully.',
      );
    } else {
      await bookingsApi.reject(booking.id);
      setDecision(null);
      toast('Booking request rejected.', 'info');
    }
    setError('');
    // Background sync without re-rendering the full loading spinner
    await load(false);
  };

  const pendingCount = result.data.filter((b) => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Reservation Queue
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Booking Requests
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Review member reservation requests, confirm bookings, or resolve scheduling conflicts.
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 ring-1 ring-amber-200 shrink-0">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            {pendingCount} Pending Review
          </span>
        )}
      </div>

      <Alert tone="info">
        Approving a booking automatically updates overlapping pending requests to rejected in the
        same transaction to guarantee zero double bookings.
      </Alert>

      <Alert>{error}</Alert>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 bg-slate-50/70 p-4">
          <Select
            ariaLabel="Filter by status"
            className="w-40 sm:w-44"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={setFilter('status')}
          />

          <Select
            ariaLabel="Filter by space"
            className="w-48 sm:w-56"
            options={[
              { value: '', label: 'All Spaces' },
              ...spaces.map((space) => ({ value: String(space.id), label: space.name })),
            ]}
            value={String(filters.spaceId)}
            onChange={setFilter('spaceId')}
          />

          <DatePicker
            ariaLabel="Filter by date"
            className="w-44"
            placeholder="Filter by date..."
            value={filters.date}
            onChange={(d) => setFilter('date')(d)}
          />

          {(filters.status !== 'all' || filters.spaceId || filters.date) && (
            <button
              type="button"
              onClick={() => setFilters(BLANK_FILTERS)}
              className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 hover:text-navy-900 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Workspace
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Member
                </th>
                <th className="hidden px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:table-cell">
                  Date &amp; Time
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-slate-400" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <i className="ph ph-spinner animate-spin text-lg" /> Loading bookings...
                    </div>
                  </td>
                </tr>
              ) : result.data.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={5}>
                    No bookings found matching the selected filters.
                  </td>
                </tr>
              ) : (
                result.data.map((booking) => {
                  const isPending = booking.status === 'pending';
                  return (
                    <tr
                      key={booking.id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      {/* Space Name & Icon */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
                            <i className={`ph ${SPACE_TYPE_ICONS[booking.spaceType] || 'ph-door'}`} />
                          </span>
                          <div>
                            <p className="font-bold text-navy-900">{booking.spaceName}</p>
                            <p className="text-[11px] font-medium text-slate-400 capitalize">
                              {booking.spaceType?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Member Info & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-7 w-7 place-items-center rounded-full bg-teal-600 text-[11px] font-bold text-white uppercase">
                            {booking.userName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-navy-900">{booking.userName}</p>
                            <p className="text-xs text-slate-400">{booking.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* When */}
                      <td className="hidden px-5 py-3.5 whitespace-nowrap sm:table-cell">
                        <p className="font-bold text-navy-900">{formatDate(booking.startsAt)}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          {formatTime(booking.startsAt)} – {formatTime(booking.endsAt)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setDecision({ booking, action: 'approve' })}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-100 transition-colors shadow-xs"
                            >
                              <i className="ph ph-check font-bold" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDecision({ booking, action: 'reject' })}
                              className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-300 hover:bg-rose-100 transition-colors shadow-xs"
                            >
                              <i className="ph ph-x font-bold" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 capitalize">
                            {booking.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination pagination={result.pagination} onChange={setPage} noun="booking request" />

      {decision && (
        <ConfirmDialog
          title={decision.action === 'approve' ? 'Approve Booking Request?' : 'Reject Booking Request?'}
          tone={decision.action === 'approve' ? 'brand' : 'danger'}
          rows={[
            { label: 'Member', value: decision.booking.userName },
            { label: 'Workspace', value: decision.booking.spaceName },
            {
              label: 'Slot',
              value: `${formatDate(decision.booking.startsAt)}, ${formatTime(
                decision.booking.startsAt,
              )} – ${formatTime(decision.booking.endsAt)}`,
            },
          ]}
          note={
            decision.action === 'approve'
              ? 'Any overlapping pending requests will be automatically marked as rejected.'
              : undefined
          }
          confirmLabel={decision.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          onConfirm={applyDecision}
          onClose={() => setDecision(null)}
        />
      )}
    </div>
  );
}
