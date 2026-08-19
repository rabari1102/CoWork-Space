import { useEffect, useState } from 'react';
import Alert from './Alert.jsx';
import { readApiError } from '../api/client.js';
import { spacesApi } from '../api/endpoints.js';
import { formatDate, formatTime, todayIso } from '../utils/format.js';

/** Lists and edits the blackout windows that make a space unbookable. */
export default function MaintenancePanel({ space }) {
  const [windows, setWindows] = useState([]);
  const [form, setForm] = useState({
    date: todayIso(),
    startTime: '08:00',
    endTime: '18:00',
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    spacesApi
      .maintenance(space.id)
      .then((data) => {
        if (!cancelled) setWindows(data);
      })
      .catch((err) => {
        if (!cancelled) setError(readApiError(err, 'Could not load maintenance windows'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [space.id]);

  const reload = () => spacesApi.maintenance(space.id).then(setWindows);

  const add = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await spacesApi.addMaintenance(space.id, {
        startsAt: `${form.date}T${form.startTime}`,
        endsAt: `${form.date}T${form.endTime}`,
        reason: form.reason,
      });
      setForm({ ...form, reason: '' });
      await reload();
    } catch (err) {
      setError(readApiError(err, 'Could not block out that window'));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await spacesApi.removeMaintenance(space.id, id);
      await reload();
    } catch (err) {
      setError(readApiError(err, 'Could not remove that window'));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Blocked out</h3>

        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Loading...</p>
        ) : windows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No maintenance windows for this space.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {windows.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200"
              >
                <span>
                  <span className="font-medium text-slate-700">
                    {formatDate(item.startsAt)}, {formatTime(item.startsAt)} - {formatTime(item.endsAt)}
                  </span>
                  {item.reason && <span className="ml-2 text-slate-500">{item.reason}</span>}
                </span>
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-rose-600 hover:underline"
                  onClick={() => remove(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={add} className="space-y-3 border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
          Block out a new window
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label" htmlFor="mw-date">
              Date
            </label>
            <input
              id="mw-date"
              type="date"
              className="field"
              required
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="mw-start">
              From
            </label>
            <input
              id="mw-start"
              type="time"
              className="field"
              required
              value={form.startTime}
              onChange={(event) => setForm({ ...form, startTime: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="mw-end">
              To
            </label>
            <input
              id="mw-end"
              type="time"
              className="field"
              required
              value={form.endTime}
              onChange={(event) => setForm({ ...form, endTime: event.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="mw-reason">
            Reason
          </label>
          <input
            id="mw-reason"
            className="field"
            placeholder="Deep clean, projector repair..."
            value={form.reason}
            onChange={(event) => setForm({ ...form, reason: event.target.value })}
          />
        </div>

        <Alert>{error}</Alert>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Blocking...' : 'Block out window'}
        </button>
      </form>
    </div>
  );
}
