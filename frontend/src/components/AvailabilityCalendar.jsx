import { formatTime, minutesFromMidnight } from '../utils/format.js';

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const WINDOW_START = DAY_START_HOUR * 60;
const WINDOW_END = DAY_END_HOUR * 60;
const WINDOW_MINUTES = WINDOW_END - WINDOW_START;

// Every other hour, so the axis stays readable at narrow widths.
const AXIS_HOURS = [];
for (let hour = DAY_START_HOUR; hour <= DAY_END_HOUR; hour += 2) {
  AXIS_HOURS.push(hour);
}

const BLOCK_STYLES = {
  approved: 'bg-emerald-50 ring-emerald-500/20 text-emerald-700',
  pending: 'bg-amber-50 ring-amber-500/20 text-amber-700',
  maintenance: 'bg-purple-50 ring-purple-500/20 text-purple-700',
};

const LEGEND = [
  { label: 'Approved', swatch: 'bg-emerald-100 ring-emerald-500/20' },
  { label: 'Pending', swatch: 'bg-amber-100 ring-amber-500/20' },
  { label: 'Maintenance', swatch: 'bg-purple-100 ring-purple-500/20' },
  { label: 'Available', swatch: 'bg-slate-100 ring-slate-200' },
];

/**
 * Day view for one space, laid out along a horizontal 08:00-20:00 axis.
 * Anything not covered by a block is free to book.
 */
export default function AvailabilityCalendar({ bookings = [], maintenance = [], loading }) {
  const blocks = [
    ...maintenance.map((item) => ({
      key: `m-${item.id}`,
      kind: 'maintenance',
      label: item.reason || 'Maintenance',
      startsAt: item.startsAt,
      endsAt: item.endsAt,
    })),
    ...bookings.map((item) => ({
      key: `b-${item.id}`,
      kind: item.status,
      label: item.status === 'approved' ? 'Approved' : 'Pending',
      startsAt: item.startsAt,
      endsAt: item.endsAt,
    })),
  ]
    .map((block) => {
      // Clamp to the visible window so an all-day block still renders sensibly.
      const start = Math.max(minutesFromMidnight(block.startsAt), WINDOW_START);
      const end = Math.min(minutesFromMidnight(block.endsAt), WINDOW_END);
      return {
        ...block,
        left: ((start - WINDOW_START) / WINDOW_MINUTES) * 100,
        width: ((end - start) / WINDOW_MINUTES) * 100,
        visible: end > start,
      };
    })
    .filter((block) => block.visible);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-600">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ring-1 ${item.swatch}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="hide-scroll overflow-x-auto rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <div className="min-w-[600px]">
          {/* Labels are placed at their true offset so they line up with the
              gridlines below rather than being spread evenly. */}
          <div className="relative mb-2 h-4 text-xs text-slate-400">
            {AXIS_HOURS.map((hour) => (
              <span
                key={hour}
                className="absolute -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${((hour * 60 - WINDOW_START) / WINDOW_MINUTES) * 100}%` }}
              >
                {String(hour).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          <div className="relative h-12 overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-200">
            {AXIS_HOURS.slice(1).map((hour) => (
              <div
                key={hour}
                className="absolute inset-y-0 w-px bg-slate-200/70"
                style={{ left: `${((hour * 60 - WINDOW_START) / WINDOW_MINUTES) * 100}%` }}
              />
            ))}

            {loading ? (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                Loading availability...
              </p>
            ) : blocks.length === 0 ? (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                Free all day
              </p>
            ) : (
              blocks.map((block) => (
                <div
                  key={block.key}
                  className={`absolute inset-y-1 flex items-center justify-center overflow-hidden rounded px-1 text-[10px] font-medium ring-1 ${
                    BLOCK_STYLES[block.kind]
                  }`}
                  style={{ left: `${block.left}%`, width: `${block.width}%` }}
                  title={`${block.label}: ${formatTime(block.startsAt)} - ${formatTime(block.endsAt)}`}
                >
                  <span className="truncate">{block.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
