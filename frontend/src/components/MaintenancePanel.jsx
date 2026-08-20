import { useEffect, useState } from 'react';
import Alert from './Alert.jsx';
import DatePicker from './DatePicker.jsx';
import { readApiError } from '../api/client.js';
import { spacesApi } from '../api/endpoints.js';
import { formatDate, formatTime, todayIso } from '../utils/format.js';

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

  // Compute if the currently selected slot overlaps with any existing window
  const currentStartsAt = `${form.date} ${form.startTime}:00`;
  const currentEndsAt = `${form.date} ${form.endTime}:00`;
  const isTimeInvalid =
    !form.date || !form.startTime || !form.endTime || form.startTime >= form.endTime;

  const overlappingWindow = windows.find((win) => {
    const winStart = win.startsAt;
    const winEnd = win.endsAt;
    return currentStartsAt < winEnd && currentEndsAt > winStart;
  });

  const isOverlapping = Boolean(overlappingWindow);

  const add = async (event) => {
    event.preventDefault();
    if (isOverlapping || isTimeInvalid) return;

    setError('');
    setSubmitting(true);

    try {
      await spacesApi.addMaintenance(space.id, {
        startsAt: `${form.date}T${form.startTime}`,
        endsAt: `${form.date}T${form.endTime}`,
        reason: form.reason.trim(),
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
    <div className="space-y-6">
      {/* Existing Windows List */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Active Maintenance Windows
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {windows.length} {windows.length === 1 ? 'window' : 'windows'}
          </span>
        </div>

        {loading ? (
          <div className="mt-3 flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
            <i className="ph ph-spinner animate-spin text-base" /> Loading maintenance windows...
          </div>
        ) : windows.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
            No scheduled maintenance or repairs for this workspace.
          </div>
        ) : (
          <ul className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {windows.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-purple-200/80 bg-purple-50/40 p-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700">
                    <i className="ph ph-wrench" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-navy-900 truncate">
                      {formatDate(item.startsAt)} ({formatTime(item.startsAt)} – {formatTime(item.endsAt)})
                    </p>
                    {item.reason && (
                      <p className="truncate text-slate-500">{item.reason}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-slate-200 hover:bg-rose-50 transition-colors shrink-0"
                  onClick={() => remove(item.id)}
                >
                  <i className="ph ph-trash" />
                  <span>Remove</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* New Maintenance Window Form */}
      <form onSubmit={add} className="space-y-4 border-t border-slate-200/80 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
          Schedule New Repair / Blackout
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="mw-date">
              Date
            </label>
            <DatePicker
              value={form.date}
              onChange={(date) => setForm({ ...form, date })}
              className="w-full"
            />
          </div>

          <div>
            <label className="label" htmlFor="mw-start">
              Start Time
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
              End Time
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

        {/* Quick presets */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Quick presets:</span>
          <button
            type="button"
            onClick={() => setForm({ ...form, startTime: '08:00', endTime: '18:00' })}
            className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
          >
            Full Day (08:00 - 18:00)
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, startTime: '08:00', endTime: '12:00' })}
            className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
          >
            Morning Only
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, startTime: '12:00', endTime: '18:00' })}
            className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
          >
            Afternoon Only
          </button>
        </div>

        <div>
          <label className="label" htmlFor="mw-reason">
            Maintenance Reason
          </label>
          <input
            id="mw-reason"
            className="field"
            placeholder="e.g. AV equipment maintenance, deep sanitization, electrical upgrade..."
            value={form.reason}
            onChange={(event) => setForm({ ...form, reason: event.target.value })}
          />
        </div>

        {/* Overlap Warning Indicator */}
        {isOverlapping && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs font-semibold text-amber-800 animate-scale-in">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
              <i className="ph ph-warning-circle text-base font-bold" />
            </span>
            <p>
              This time slot is already added as a blocked out window. Please change the time or date.
            </p>
          </div>
        )}

        {isTimeInvalid && !isOverlapping && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/80 p-2.5 text-xs font-semibold text-rose-800">
            <i className="ph ph-x-circle text-base text-rose-600 shrink-0" />
            <span>End time must be after start time.</span>
          </div>
        )}

        <Alert>{error}</Alert>

        <div
          title={
            isOverlapping
              ? 'This time is already added as blocked out. Please change the time or date.'
              : isTimeInvalid
              ? 'End time must be after start time.'
              : 'Block out this maintenance window'
          }
        >
          <button
            type="submit"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              isOverlapping || isTimeInvalid
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-purple-600 text-white shadow-md shadow-purple-600/20 hover:bg-purple-700 active:scale-[0.98]'
            }`}
            disabled={isOverlapping || isTimeInvalid || submitting}
          >
            {submitting ? (
              <>
                <i className="ph ph-circle-notch animate-spin text-base" />
                <span>Blocking out window...</span>
              </>
            ) : isOverlapping ? (
              <>
                <i className="ph ph-prohibit text-base" />
                <span>Time Slot Already Blocked Out</span>
              </>
            ) : (
              <>
                <i className="ph ph-shield-plus text-base" />
                <span>Block Out Window</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
