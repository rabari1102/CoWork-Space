import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import AvailabilityCalendar from '../components/AvailabilityCalendar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DatePicker from '../components/DatePicker.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Reveal from '../components/Reveal.jsx';
import SpaceArtwork from '../components/SpaceArtwork.jsx';
import { readApiError } from '../api/client.js';
import { bookingsApi, spacesApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  formatDate,
  formatDuration,
  SPACE_TYPE_ICONS,
  SPACE_TYPE_LABELS,
  todayIso,
} from '../utils/format.js';

export default function SpaceDetailPage() {
  const { id } = useParams();
  const { user, isMember } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [date, setDate] = useState(todayIso());
  const [availability, setAvailability] = useState({ bookings: [], maintenance: [] });
  const [loadingSpace, setLoadingSpace] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [pageError, setPageError] = useState('');

  const [form, setForm] = useState({ startTime: '10:00', endTime: '12:00' });
  const [bookingError, setBookingError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const duration = formatDuration(form.startTime, form.endTime);

  useEffect(() => {
    setLoadingSpace(true);
    spacesApi
      .get(id)
      .then(setSpace)
      .catch((error) => setPageError(readApiError(error, 'Could not load this space')))
      .finally(() => setLoadingSpace(false));
  }, [id]);

  const loadAvailability = useCallback(() => {
    setLoadingSlots(true);
    return spacesApi
      .availability(id, date)
      .then(setAvailability)
      .catch((error) => setPageError(readApiError(error, 'Could not load availability')))
      .finally(() => setLoadingSlots(false));
  }, [id, date]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const startBooking = () => {
    setBookingError('');
    if (!user) {
      toast('Sign in to book a workspace.', 'info');
      navigate('/login', { state: { from: `/spaces/${id}` } });
      return;
    }
    if (!duration) {
      setBookingError('The booking must end after it starts.');
      return;
    }
    setConfirming(true);
  };

  const submitBooking = async () => {
    await bookingsApi.create({
      spaceId: Number(id),
      startsAt: `${date}T${form.startTime}`,
      endsAt: `${date}T${form.endTime}`,
    });
    setConfirming(false);
    toast("You're all set. An admin will confirm your request shortly.");
    await loadAvailability();
  };

  if (loadingSpace) {
    return (
      <div className="page">
        <div className="skeleton h-72 rounded-3xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <div className="skeleton h-9 w-2/3" />
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-24 w-full" />
          </div>
          <div className="skeleton h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="page">
        <EmptyState
          icon="ph-warning-circle"
          tone="error"
          title="We couldn't load that workspace"
          description={pageError || 'The space may have been removed.'}
          actionLabel="Back to all spaces"
          actionTo="/"
        />
      </div>
    );
  }

  return (
    <div className="page">
      <Link
        to="/"
        className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-navy-900"
      >
        <i className="ph ph-arrow-left transition-transform group-hover:-translate-x-1" />
        All workspaces
      </Link>

      {/* Header banner: the generated artwork, scaled up, with the title over it. */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl">
          <SpaceArtwork space={space} className="h-56 w-full sm:h-72" showLabel={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/35 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              <i className={`ph ${SPACE_TYPE_ICONS[space.type]}`} />
              {SPACE_TYPE_LABELS[space.type]}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {space.name}
            </h1>
            <p className="mt-2 flex items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <i className="ph ph-users" /> Seats {space.capacity}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="ph ph-sparkle" /> {space.amenities.length} amenities
              </span>
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <div className="space-y-10">
          {space.description && (
            <Reveal>
              <h2 className="text-xl font-bold text-navy-900">About this space</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{space.description}</p>
            </Reveal>
          )}

          {space.amenities.length > 0 && (
            <Reveal>
              <h2 className="text-xl font-bold text-navy-900">What's included</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {space.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <i className="ph ph-check text-base" />
                    </span>
                    {amenity}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-navy-900">Availability</h2>
              <input
                type="date"
                className="field w-auto py-2"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                aria-label="Availability date"
              />
            </div>
            <AvailabilityCalendar
              bookings={availability.bookings}
              maintenance={availability.maintenance}
              loading={loadingSlots}
            />
          </Reveal>
        </div>

        {/* Sticky booking panel */}
        <div className="relative">
          <div className="sticky top-24 overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-slate-200/80">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <h2 className="text-lg font-bold text-navy-900">Book this space</h2>
              <p className="mt-0.5 text-sm text-slate-500">Choose a date and an available slot.</p>
            </div>

            <div className="p-6">
              {user && !isMember ? (
                <p className="rounded-2xl bg-violet-50 p-4 text-sm text-violet-800 ring-1 ring-violet-100">
                  Admin accounts manage the schedule rather than book it.
                </p>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    startBooking();
                  }}
                >
                  <div>
                    <label className="label" htmlFor="booking-date">
                      Date
                    </label>
                    <DatePicker
                      id="booking-date"
                      ariaLabel="Date"
                      min={todayIso()}
                      placeholder="Select booking date..."
                      value={date}
                      onChange={(val) => setDate(val)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label" htmlFor="booking-start">
                        From
                      </label>
                      <input
                        id="booking-start"
                        type="time"
                        className="field"
                        required
                        value={form.startTime}
                        onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="booking-end">
                        To
                      </label>
                      <input
                        id="booking-end"
                        type="time"
                        className="field"
                        required
                        value={form.endTime}
                        onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 px-4 py-3.5 ring-1 ring-brand-100">
                    <span className="text-sm text-slate-600">Duration</span>
                    <span className="text-lg font-bold text-navy-900">{duration || '--'}</span>
                  </div>

                  <Alert>{bookingError}</Alert>

                  <button type="submit" className="btn-primary w-full py-3 text-[15px]">
                    Reserve workspace
                  </button>

                  <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                    <i className="ph ph-info mt-0.5 shrink-0 text-sm text-slate-400" />
                    Requests start as pending. An admin approves them, and overlapping slots are
                    rejected automatically.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Confirm your booking"
          icon="ph-calendar-plus"
          rows={[
            { label: 'Space', value: space.name },
            { label: 'Date', value: formatDate(date) },
            { label: 'Time', value: `${form.startTime} - ${form.endTime}` },
            { label: 'Duration', value: duration },
          ]}
          confirmLabel="Confirm request"
          onConfirm={submitBooking}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
