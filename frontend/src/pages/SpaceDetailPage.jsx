import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import AvailabilityCalendar from '../components/AvailabilityCalendar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { readApiError } from '../api/client.js';
import { bookingsApi, spacesApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatDuration, SPACE_TYPE_ICONS, SPACE_TYPE_LABELS, todayIso } from '../utils/format.js';

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
      toast('Please sign in to book a workspace.', 'info');
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
    toast('Booking request submitted. An admin will review it shortly.');
    await loadAvailability();
  };

  if (loadingSpace) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading space...</p>;
  }
  if (!space) {
    return (
      <div className="card p-10 text-center">
        <Alert>{pageError || 'Space not found'}</Alert>
        <Link to="/" className="btn-secondary mt-4">
          Back to all spaces
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        to="/"
        className="group mb-6 flex w-fit items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <i className="ph ph-arrow-left mr-2 transition-transform group-hover:-translate-x-1" />
        Back to spaces
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <div>
            <span className="mb-3 inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
              <i className={`ph ${SPACE_TYPE_ICONS[space.type]} mr-1`} />
              {SPACE_TYPE_LABELS[space.type]}
            </span>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">{space.name}</h1>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <i className="ph ph-users" /> {space.capacity} seats
            </p>
          </div>

          {space.description && (
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">{space.description}</p>
          )}

          {space.amenities.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900">
                Amenities
              </h2>
              <ul className="flex flex-wrap gap-2">
                {space.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200"
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <hr className="border-slate-200" />

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
              <input
                type="date"
                className="field w-auto py-1.5"
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
          </div>
        </div>

        <div className="relative lg:col-span-4">
          <div className="sticky top-24 rounded-xl bg-white p-6 shadow-modal ring-1 ring-slate-200">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Book this space</h2>
            <p className="mb-6 text-sm text-slate-500">Choose a date and available time.</p>

            {user && !isMember ? (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 ring-1 ring-slate-200">
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
                  <input
                    id="booking-date"
                    type="date"
                    className="field"
                    required
                    min={todayIso()}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium text-slate-900">{duration || '--'}</span>
                </div>

                <Alert>{bookingError}</Alert>

                <button type="submit" className="btn-primary mt-4 w-full">
                  Request booking
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Requests start as pending and require admin approval.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Confirm booking request"
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
    </>
  );
}
