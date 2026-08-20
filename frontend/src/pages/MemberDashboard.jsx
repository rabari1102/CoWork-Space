import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { readApiError } from '../api/client.js';
import { bookingsApi } from '../api/endpoints.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  formatDate,
  formatTime,
  SPACE_TYPE_ICONS,
  SPACE_TYPE_LABELS,
} from '../utils/format.js';

const TABS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

const STAT_CARDS = [
  { key: 'total', label: 'Total', icon: 'ph-calendar-check', tint: 'bg-slate-50 text-slate-400' },
  { key: 'pending', label: 'Pending', icon: 'ph-hourglass', tint: 'bg-amber-50 text-amber-500' },
  { key: 'approved', label: 'Approved', icon: 'ph-check-circle', tint: 'bg-emerald-50 text-emerald-500' },
];

export default function MemberDashboard() {
  const { toast } = useToast();

  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: null });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [viewBooking, setViewBooking] = useState(null);

  const load = useCallback((showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError('');
    return bookingsApi
      .mine({ page, limit: 10, ...(status === 'all' ? {} : { status }) })
      .then(setResult)
      .catch((err) => setError(readApiError(err, 'Could not load your bookings')))
      .finally(() => {
        if (showSpinner) setLoading(false);
      });
  }, [page, status]);

  // Counts come from the API rather than the current page, so they stay right
  // no matter which tab is open or how many bookings the member has.
  const loadStats = useCallback(
    () =>
      bookingsApi
        .myStats()
        .then(setStats)
        .catch(() => {}),
    [],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const cancelBooking = async () => {
    const targetId = cancelTarget.id;
    setCancelTarget(null);
    if (viewBooking?.id === targetId) {
      setViewBooking(null);
    }

    // Optimistic update: flip status to 'cancelled' immediately
    setResult((prev) => ({
      ...prev,
      data: prev.data.map((b) => (b.id === targetId ? { ...b, status: 'cancelled' } : b)),
    }));

    try {
      await bookingsApi.cancel(targetId);
      toast('Booking cancelled successfully.', 'info');
    } catch (err) {
      toast(readApiError(err, 'Could not cancel booking'), 'error');
    }
    await Promise.all([load(false), loadStats()]);
  };

  // The API allows cancelling only a future booking that is still live.
  const isCancellable = (booking) =>
    ['pending', 'approved'].includes(booking?.status) && new Date(booking?.startsAt) > new Date();

  return (
    <div className="page">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="eyebrow">Account</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">
            My bookings
          </h1>
          <p className="mt-2 text-slate-500">
            Track your workspace reservations and manage upcoming requests.
          </p>
        </div>
        <Link to="/" className="btn-secondary w-fit">
          Browse spaces
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">{card.label}</p>
              <p className="text-2xl font-semibold text-slate-900">{stats[card.key]}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.tint}`}>
              <i className={`ph ${card.icon} text-xl`} />
            </div>
          </div>
        ))}
      </div>

      <div className="hide-scroll mb-6 w-full overflow-x-auto pb-1">
        <div className="inline-flex rounded-xl bg-slate-100/50 p-1 ring-1 ring-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStatus(tab);
                setPage(1);
              }}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                status === tab
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50'
                  : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <Alert>{error}</Alert>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" />
          ))}
        </div>
      ) : result.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <i className="ph ph-calendar-blank text-2xl text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Nothing here yet</h3>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            Book a workspace to see your reservations here.
          </p>
          <Link to="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Browse spaces &rarr;
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {result.data.map((booking) => (
            <li
              key={booking.id}
              className="flex flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200 sm:flex">
                  <i className={`ph ${SPACE_TYPE_ICONS[booking.spaceType] || 'ph-door'} text-xl`} />
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{booking.spaceName}</h2>
                    <StatusBadge status={booking.status} size="sm" />
                  </div>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <i className="ph ph-calendar-blank" /> {formatDate(booking.startsAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ph ph-clock" /> {formatTime(booking.startsAt)} -{' '}
                      {formatTime(booking.endsAt)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                <button
                  type="button"
                  onClick={() => setViewBooking(booking)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors shadow-xs"
                >
                  <i className="ph ph-eye text-sm" />
                  <span>View Details</span>
                </button>
                {isCancellable(booking) && (
                  <button
                    type="button"
                    onClick={() => setCancelTarget(booking)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors shadow-xs"
                  >
                    <i className="ph ph-trash text-sm" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination pagination={result.pagination} onChange={setPage} noun="booking" />

      {/* Booking Details Modal */}
      {viewBooking && (
        <Modal
          title="Booking Details"
          subtitle={`Reservation #${viewBooking.id}`}
          onClose={() => setViewBooking(null)}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-teal-600 ring-1 ring-slate-200 shadow-xs">
                  <i className={`ph ${SPACE_TYPE_ICONS[viewBooking.spaceType] || 'ph-door'} text-xl`} />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900">{viewBooking.spaceName}</h3>
                  <p className="text-xs text-slate-400 capitalize">
                    {SPACE_TYPE_LABELS[viewBooking.spaceType] || viewBooking.spaceType?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <StatusBadge status={viewBooking.status} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                <p className="mt-1 font-semibold text-navy-900">{formatDate(viewBooking.startsAt)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Time Slot</p>
                <p className="mt-1 font-semibold text-navy-900">
                  {formatTime(viewBooking.startsAt)} – {formatTime(viewBooking.endsAt)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reserved For</p>
                <p className="mt-1 font-semibold text-navy-900">{viewBooking.userName}</p>
                <p className="text-xs text-slate-400">{viewBooking.userEmail}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Requested On</p>
                <p className="mt-1 font-semibold text-navy-900">{formatDate(viewBooking.createdAt)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:justify-between">
              <Link
                to={`/spaces/${viewBooking.spaceId}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy-900 shadow-xs hover:bg-slate-50 transition-colors"
                onClick={() => setViewBooking(null)}
              >
                <i className="ph ph-arrow-square-out text-sm" />
                <span>View Workspace Page</span>
              </Link>
              <div className="flex items-center gap-2">
                {isCancellable(viewBooking) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancelTarget(viewBooking);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <i className="ph ph-trash text-sm" />
                    <span>Cancel Booking</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewBooking(null)}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelTarget && (
        <ConfirmDialog
          title="Cancel this booking?"
          icon="ph-trash"
          tone="danger"
          rows={[
            { label: 'Space', value: cancelTarget.spaceName },
            { label: 'Date', value: formatDate(cancelTarget.startsAt) },
            {
              label: 'Time',
              value: `${formatTime(cancelTarget.startsAt)} - ${formatTime(cancelTarget.endsAt)}`,
            },
          ]}
          cancelLabel="Keep booking"
          confirmLabel="Cancel booking"
          onConfirm={cancelBooking}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
