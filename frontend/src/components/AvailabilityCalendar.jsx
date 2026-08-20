import { useMemo } from 'react';
import DatePicker from './DatePicker.jsx';
import { formatTime, minutesFromMidnight, todayIso } from '../utils/format.js';

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const WINDOW_START = DAY_START_HOUR * 60;
const WINDOW_END = DAY_END_HOUR * 60;
const WINDOW_MINUTES = WINDOW_END - WINDOW_START;

const AXIS_HOURS = [8, 10, 12, 14, 16, 18, 20];

// Preset selectable 2-hour slots for quick booking
const STANDARD_SLOTS = [
  { start: '08:00', end: '10:00', label: 'Early Morning' },
  { start: '10:00', end: '12:00', label: 'Late Morning' },
  { start: '12:00', end: '14:00', label: 'Midday' },
  { start: '14:00', end: '16:00', label: 'Afternoon' },
  { start: '16:00', end: '18:00', label: 'Late Afternoon' },
  { start: '18:00', end: '20:00', label: 'Evening' },
];

export default function AvailabilityCalendar({
  bookings = [],
  maintenance = [],
  loading = false,
  selectedDate = todayIso(),
  onDateChange,
  selectedStartTime = '10:00',
  selectedEndTime = '12:00',
  onSelectSlot,
}) {
  // Parse booked and maintenance blocks
  const blocks = useMemo(() => {
    return [
      ...maintenance.map((item) => ({
        key: `m-${item.id}`,
        kind: 'maintenance',
        label: item.reason || 'Maintenance',
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        startMinutes: minutesFromMidnight(item.startsAt),
        endMinutes: minutesFromMidnight(item.endsAt),
      })),
      ...bookings.map((item) => ({
        key: `b-${item.id}`,
        kind: item.status,
        label: item.status === 'approved' ? 'Booked' : 'Pending',
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        startMinutes: minutesFromMidnight(item.startsAt),
        endMinutes: minutesFromMidnight(item.endsAt),
      })),
    ]
      .map((block) => {
        const start = Math.max(block.startMinutes, WINDOW_START);
        const end = Math.min(block.endMinutes, WINDOW_END);
        return {
          ...block,
          left: ((start - WINDOW_START) / WINDOW_MINUTES) * 100,
          width: Math.max(((end - start) / WINDOW_MINUTES) * 100, 2),
          visible: end > start,
        };
      })
      .filter((b) => b.visible);
  }, [bookings, maintenance]);

  // Check if a given time interval overlaps with any booking or maintenance
  const isSlotBooked = (startStr, endStr) => {
    const slotStart = minutesFromMidnight(`2000-01-01T${startStr}`);
    const slotEnd = minutesFromMidnight(`2000-01-01T${endStr}`);

    return blocks.some((block) => {
      return slotStart < block.endMinutes && slotEnd > block.startMinutes;
    });
  };

  // Selected slot position for overlay highlight
  const selectedRange = useMemo(() => {
    if (!selectedStartTime || !selectedEndTime) return null;
    const start = Math.max(minutesFromMidnight(`2000-01-01T${selectedStartTime}`), WINDOW_START);
    const end = Math.min(minutesFromMidnight(`2000-01-01T${selectedEndTime}`), WINDOW_END);
    if (end <= start) return null;
    return {
      left: ((start - WINDOW_START) / WINDOW_MINUTES) * 100,
      width: ((end - start) / WINDOW_MINUTES) * 100,
    };
  }, [selectedStartTime, selectedEndTime]);

  const totalBookedHours = useMemo(() => {
    const totalMinutes = blocks.reduce((acc, b) => acc + (b.endMinutes - b.startMinutes), 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [blocks]);

  const today = todayIso();
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  return (
    <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200/80">
      {/* Top Header with Date Controls & Live Status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-navy-900">Live Space Schedule</h3>
            {loading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                <i className="ph ph-spinner animate-spin text-xs" /> Checking...
              </span>
            ) : blocks.length === 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 100% Free
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {totalBookedHours}h Reserved
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Select a slot below to auto-fill your booking time.
          </p>
        </div>

        {/* Date Selector Shortcuts & Picker */}
        <div className="flex items-center gap-2">
          {onDateChange && (
            <>
              <button
                type="button"
                onClick={() => onDateChange(today)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedDate === today
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => onDateChange(tomorrow)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedDate === tomorrow
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tomorrow
              </button>
              <DatePicker
                ariaLabel="Select schedule date"
                min={today}
                value={selectedDate}
                onChange={onDateChange}
                className="w-44"
              />
            </>
          )}
        </div>
      </div>

      {/* Visual Timeline Bar (08:00 - 20:00) */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-600">Day Timeline (08:00 – 20:00)</span>
          <span>Operating hours: 12h window</span>
        </div>

        <div className="relative">
          {/* Axis Labels */}
          <div className="relative mb-2 h-4 text-[11px] font-semibold text-slate-400">
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

          {/* Timeline Bar Track */}
          <div className="relative h-11 overflow-hidden rounded-2xl bg-slate-100/90 ring-1 ring-slate-200/80 shadow-inner">
            {/* Hour grid lines */}
            {AXIS_HOURS.slice(1).map((hour) => (
              <div
                key={hour}
                className="absolute inset-y-0 w-px bg-slate-200"
                style={{ left: `${((hour * 60 - WINDOW_START) / WINDOW_MINUTES) * 100}%` }}
              />
            ))}

            {/* Booked / Reserved Blocks */}
            {blocks.map((block) => {
              const isApproved = block.kind === 'approved';
              const isPending = block.kind === 'pending';
              return (
                <div
                  key={block.key}
                  className={`absolute inset-y-1 z-10 flex items-center justify-center rounded-xl px-2 text-xs font-bold shadow-sm transition-transform hover:scale-[1.02] ${
                    isApproved
                      ? 'bg-rose-500 text-white shadow-rose-500/20'
                      : isPending
                      ? 'bg-amber-400 text-navy-950 shadow-amber-400/20'
                      : 'bg-purple-500 text-white shadow-purple-500/20'
                  }`}
                  style={{ left: `${block.left}%`, width: `${block.width}%` }}
                  title={`${block.label}: ${formatTime(block.startsAt)} - ${formatTime(block.endsAt)}`}
                >
                  <span className="truncate flex items-center gap-1">
                    <i className="ph ph-lock text-xs" />
                    {block.label}
                  </span>
                </div>
              );
            })}

            {/* Selected Range Highlight */}
            {selectedRange && (
              <div
                className="absolute inset-y-0.5 z-20 rounded-xl border-2 border-brand-500 bg-brand-400/30 backdrop-blur-xs transition-all animate-fade-in"
                style={{ left: `${selectedRange.left}%`, width: `${selectedRange.width}%` }}
                title={`Your selection: ${selectedStartTime} - ${selectedEndTime}`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-navy-900">
                  <span className="bg-white/90 px-2 py-0.5 rounded shadow-sm text-brand-700">
                    Selected
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Quick Time Slot Selection Grid */}
      <div className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Available Time Slots
          </span>
          <span className="text-xs text-slate-400">Click any slot to select</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {STANDARD_SLOTS.map((slot) => {
            const booked = isSlotBooked(slot.start, slot.end);
            const isSelected = selectedStartTime === slot.start && selectedEndTime === slot.end;

            return (
              <button
                key={slot.start}
                type="button"
                disabled={booked}
                onClick={() => onSelectSlot && onSelectSlot({ startTime: slot.start, endTime: slot.end })}
                className={`group relative flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all ${
                  isSelected
                    ? 'border-2 border-brand-500 bg-brand-50/70 text-navy-900 shadow-md ring-2 ring-brand-500/20'
                    : booked
                    ? 'border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                    : 'border border-slate-200 bg-white text-navy-900 hover:border-brand-300 hover:bg-brand-50/30 hover:shadow-sm'
                }`}
              >
                <span className="text-xs font-extrabold tracking-tight">
                  {slot.start} – {slot.end}
                </span>
                <span className="mt-1 text-[10px] font-medium text-slate-500">
                  {slot.label}
                </span>

                <span className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold">
                  {booked ? (
                    <span className="text-rose-600 flex items-center gap-0.5">
                      <i className="ph ph-prohibit" /> Reserved
                    </span>
                  ) : isSelected ? (
                    <span className="text-brand-700 flex items-center gap-0.5">
                      <i className="ph ph-check-circle-fill text-brand-600" /> Selected
                    </span>
                  ) : (
                    <span className="text-emerald-700 flex items-center gap-0.5">
                      <i className="ph ph-check" /> Free
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-4 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">Status Legend:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-emerald-100 border border-emerald-300" />
          Available Slot
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-brand-400/40 border border-brand-500" />
          Your Selection
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-rose-500" />
          Confirmed Booking
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-amber-400" />
          Pending Request
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-purple-500" />
          Maintenance
        </span>
      </div>
    </div>
  );
}
