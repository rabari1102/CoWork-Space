import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import AvailabilityCalendar from '../components/AvailabilityCalendar.jsx';
import { readApiError } from '../api/client.js';
import { bookingsApi, spacesApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SPACE_TYPE_LABELS, todayIso } from '../utils/format.js';

export default function SpaceDetailPage() {
  const { id } = useParams();
  const { user, isMember } = useAuth();

  const [space, setSpace] = useState(null);
  const [date, setDate] = useState(todayIso());
  const [availability, setAvailability] = useState({ bookings: [], maintenance: [] });
  const [loadingSpace, setLoadingSpace] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [pageError, setPageError] = useState('');

  const [form, setForm] = useState({ startTime: '09:00', endTime: '10:00' });
  const [bookingError, setBookingError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const submitBooking = async (event) => {
    event.preventDefault();
    setBookingError('');
    setBookingMessage('');
    setSubmitting(true);

    try {
      await bookingsApi.create({
        spaceId: Number(id),
        startsAt: `${date}T${form.startTime}`,
        endsAt: `${date}T${form.endTime}`,
      });
      setBookingMessage('Booking requested. An admin will review it shortly.');
      await loadAvailability();
    } catch (error) {
      setBookingError(readApiError(error, 'Could not create the booking'));
    } finally {
      setSubmitting(false);
    }
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
    <div className="space-y-6">
      <Link to="/" className="text-sm text-brand-600 hover:underline">
        &larr; All spaces
      </Link>

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{space.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {SPACE_TYPE_LABELS[space.type]} &middot; seats {space.capacity}
            </p>
          </div>
        </div>

        {space.description && <p className="mt-4 text-sm text-slate-600">{space.description}</p>}

        {space.amenities.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {space.amenities.map((amenity) => (
              <li key={amenity} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {amenity}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
            <input
              type="date"
              className="field w-auto"
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
        </section>

        <aside className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Book this space</h2>

          {!user && (
            <div className="card space-y-3 p-5 text-sm text-slate-600">
              <p>Log in as a member to request this space.</p>
              <Link to="/login" className="btn-primary w-full">
                Log in
              </Link>
            </div>
          )}

          {user && !isMember && (
            <div className="card p-5 text-sm text-slate-600">
              Admin accounts manage the schedule rather than book it.
            </div>
          )}

          {isMember && (
            <form onSubmit={submitBooking} className="card space-y-4 p-5">
              <div>
                <label className="label" htmlFor="booking-date">
                  Date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  className="field"
                  value={date}
                  min={todayIso()}
                  onChange={(event) => setDate(event.target.value)}
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

              <Alert>{bookingError}</Alert>
              <Alert tone="success">{bookingMessage}</Alert>

              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Requesting...' : 'Request booking'}
              </button>
              <p className="text-xs text-slate-500">
                Requests start as pending and need an admin to approve them.
              </p>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
