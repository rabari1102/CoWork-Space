import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { formatDate, todayIso } from '../utils/format.js';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseIso(isoStr) {
  if (!isoStr) return null;
  const [y, m, d] = isoStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIso(year, monthIndex, day) {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePicker({
  value,
  onChange,
  min = todayIso(),
  placeholder = 'Select date...',
  variant = 'field',
  className = '',
  id,
  ariaLabel = 'Date',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  // Track the view month & year currently displayed in the calendar
  const initialDate = useMemo(() => parseIso(value) || parseIso(min) || new Date(), [value, min]);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = parseIso(value);
      if (d) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close calendar
  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // Monday-based index (0 = Monday, 6 = Sunday)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const totalDays = lastDayOfMonth.getDate();
    const days = [];

    // Padding for previous month
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: viewMonth - 1,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }

    // Padding for next month to complete rows of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: viewMonth + 1,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handleSelect = (dayObj) => {
    const iso = toIso(dayObj.year, dayObj.month, dayObj.day);
    if (min && iso < min) return;
    onChange(iso);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const handleToday = () => {
    const today = todayIso();
    if (min && today < min) return;
    onChange(today);
    const d = parseIso(today);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
    setOpen(false);
  };

  // Formatted trigger label
  const displayLabel = useMemo(() => {
    if (!value) return placeholder;
    const parsed = parseIso(value);
    if (!parsed) return value;
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [value, placeholder]);

  const todayStr = todayIso();

  const triggerClass =
    variant === 'bare'
      ? 'flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:text-navy-900 focus:outline-none transition-colors'
      : 'field flex items-center justify-between gap-2.5 text-left cursor-pointer';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={triggerClass}
      >
        <span className="flex items-center gap-2.5 min-w-0 truncate">
          <i className="ph ph-calendar-blank text-lg text-slate-400 shrink-0" />
          <span className={value ? 'text-navy-900 font-medium truncate' : 'text-slate-400 truncate'}>
            {displayLabel}
          </span>
        </span>

        <span className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              aria-label="Clear date"
            >
              <i className="ph ph-x text-xs" />
            </span>
          )}
          <i
            className={`ph ph-caret-down text-xs text-slate-400 transition-transform ${
              open ? 'rotate-180 text-navy-900' : ''
            }`}
          />
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          className="absolute left-0 sm:left-auto sm:right-0 top-full z-50 mt-2 w-72 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200/90 animate-scale-in"
        >
          {/* Header Month / Year & Navigation */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-navy-900">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                aria-label="Previous month"
              >
                <i className="ph ph-caret-left text-sm" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                aria-label="Next month"
              >
                <i className="ph ph-caret-right text-sm" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {WEEKDAYS.map((wd) => (
              <span key={wd} className="text-[11px] font-semibold text-slate-400 py-1">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((d, idx) => {
              const iso = toIso(d.year, d.month, d.day);
              const isSelected = value === iso;
              const isToday = todayStr === iso;
              const isDisabled = min && iso < min;

              return (
                <button
                  key={`${d.year}-${d.month}-${d.day}-${idx}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(d)}
                  className={`relative grid h-8 w-8 place-items-center rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/25'
                      : isToday
                      ? 'bg-brand-50 text-brand-700 font-bold ring-1 ring-brand-300'
                      : !d.isCurrentMonth || isDisabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-navy-900'
                  }`}
                >
                  {d.day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="font-medium text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors px-2 py-1 rounded hover:bg-brand-50"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
