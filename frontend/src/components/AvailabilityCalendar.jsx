import { formatTime, minutesFromMidnight } from '../utils/format.js';

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;
const HOUR_HEIGHT = 52;

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);

const BLOCK_STYLES = {
  approved: 'bg-brand-600/90 border-brand-700 text-white',
  pending: 'bg-amber-400/90 border-amber-500 text-amber-950',
  maintenance: 'bg-slate-400/90 border-slate-500 text-white',
};

/**
 * Day view for a single space. Bookings and maintenance windows are placed on
 * an hourly grid; anything not covered by a block is free to book.
 */
export default function AvailabilityCalendar({ bookings = [], maintenance = [], loading }) {
  const windowStart = DAY_START_HOUR * 60;
  const windowEnd = DAY_END_HOUR * 60;

  const blocks = [
    ...maintenance.map((item) => ({ ...item, kind: 'maintenance', label: item.reason || 'Maintenance' })),
    ...bookings.map((item) => ({ ...item, kind: item.status, label: `Booked (${item.status})` })),
  ]
    .map((block) => {
      // Clamp to the visible window so an all-day block still renders sensibly.
      const start = Math.max(minutesFromMidnight(block.startsAt), windowStart);
      const end = Math.min(minutesFromMidnight(block.endsAt), windowEnd);
      return { ...block, start, end };
    })
    .filter((block) => block.end > block.start);

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <Legend className="bg-brand-600" label="Approved" />
        <Legend className="bg-amber-400" label="Pending" />
        <Legend className="bg-slate-400" label="Maintenance" />
        <Legend className="border border-dashed border-slate-300 bg-white" label="Available" />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Loading availability...</p>
      ) : (
        <div className="relative flex">
          <div className="w-14 shrink-0">
            {HOURS.slice(0, -1).map((hour) => (
              <div key={hour} className="text-right text-xs text-slate-400" style={{ height: HOUR_HEIGHT }}>
                <span className="relative -top-1.5 pr-2">{String(hour).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          <div
            className="relative flex-1 rounded-lg border border-slate-200 bg-white"
            style={{ height: (HOURS.length - 1) * HOUR_HEIGHT }}
          >
            {HOURS.slice(1, -1).map((hour) => (
              <div
                key={hour}
                className="absolute inset-x-0 border-t border-dashed border-slate-100"
                style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
              />
            ))}

            {blocks.length === 0 && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                Free all day
              </p>
            )}

            {blocks.map((block) => (
              <div
                key={`${block.kind}-${block.id}`}
                className={`absolute left-1 right-1 overflow-hidden rounded-md border px-2 py-1 text-xs ${
                  BLOCK_STYLES[block.kind]
                }`}
                style={{
                  top: ((block.start - windowStart) / 60) * HOUR_HEIGHT,
                  height: Math.max(((block.end - block.start) / 60) * HOUR_HEIGHT - 2, 20),
                }}
                title={`${block.label}: ${formatTime(block.startsAt)} - ${formatTime(block.endsAt)}`}
              >
                <span className="font-medium">
                  {formatTime(block.startsAt)} - {formatTime(block.endsAt)}
                </span>
                <span className="ml-2 opacity-90">{block.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  );
}
