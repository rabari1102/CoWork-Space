import { useEffect, useRef, useState } from 'react';
import Select from './Select.jsx';

const TYPE_OPTIONS = [
  { value: '', label: 'All spaces' },
  { value: 'desk', label: 'Desk' },
  { value: 'meeting_room', label: 'Meeting room' },
];

/**
 * Search, type, capacity and date/time availability filters.
 *
 * Desktop keeps them on one toolbar with the date and capacity controls behind
 * a popover; mobile collapses the whole thing behind a single button. Both
 * layouts edit the same draft state and only lift it on submit, so typing does
 * not fire a request per keystroke.
 */
export default function SpaceFilters({ value, onApply, onReset }) {
  const [draft, setDraft] = useState(value);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (!popoverOpen) return undefined;
    const onPointerDown = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [popoverOpen]);

  const update = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));
  const setField = (field) => (value) => setDraft((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    // A time range is only meaningful alongside a date.
    onApply(draft.date ? draft : { ...draft, startTime: '', endTime: '' });
    setPopoverOpen(false);
    setMobileOpen(false);
  };

  const clear = () => {
    onReset();
    setPopoverOpen(false);
    setMobileOpen(false);
  };

  const refinementCount = [draft.date, draft.minCapacity].filter(Boolean).length;

  const dateAndCapacityFields = (
    <>
      <div>
        <label className="label" htmlFor="filter-date">
          Available on
        </label>
        <input id="filter-date" type="date" className="field" value={draft.date} onChange={update('date')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="filter-start">
            From
          </label>
          <input
            id="filter-start"
            type="time"
            className="field"
            disabled={!draft.date}
            value={draft.startTime}
            onChange={update('startTime')}
          />
        </div>
        <div>
          <label className="label" htmlFor="filter-end">
            To
          </label>
          <input
            id="filter-end"
            type="time"
            className="field"
            disabled={!draft.date}
            value={draft.endTime}
            onChange={update('endTime')}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="filter-capacity">
          Minimum capacity
        </label>
        <input
          id="filter-capacity"
          type="number"
          min="1"
          placeholder="Any"
          className="field"
          value={draft.minCapacity}
          onChange={update('minCapacity')}
        />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop toolbar */}
      <form
        onSubmit={submit}
        className="relative z-10 mb-8 hidden items-center gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200 md:flex"
      >
        <div className="flex flex-1 items-center border-r border-slate-200 px-3">
          <i className="ph ph-magnifying-glass mr-2 text-lg text-slate-400" />
          <input
            type="text"
            placeholder="Search spaces..."
            aria-label="Search spaces"
            className="w-full border-none bg-transparent py-2 text-sm focus:ring-0"
            value={draft.search}
            onChange={update('search')}
          />
        </div>

        <Select
          ariaLabel="Space type"
          variant="bare"
          options={TYPE_OPTIONS}
          value={draft.type}
          onChange={setField('type')}
        />

        <div className="h-6 w-px bg-slate-200" />

        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setPopoverOpen((open) => !open)}
            aria-expanded={popoverOpen}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Date &amp; capacity
            {refinementCount > 0 && (
              <span className="ml-1.5 rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-700">
                {refinementCount}
              </span>
            )}
            <i className="ph ph-caret-down ml-1 inline-block" />
          </button>

          {popoverOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-72 animate-fade-in space-y-4 rounded-xl bg-white p-4 shadow-modal ring-1 ring-slate-200">
              {dateAndCapacityFields}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <button type="button" onClick={clear} className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900">
          Clear
        </button>
        <button type="submit" className="btn-primary ml-1 px-5">
          Apply filters
        </button>
      </form>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="mb-6 flex w-full items-center justify-between rounded-xl bg-white p-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 md:hidden"
      >
        <span className="flex items-center gap-2">
          <i className="ph ph-sliders-horizontal" /> Filters &amp; search
        </span>
        <i className="ph ph-caret-right text-slate-400" />
      </button>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="glass-backdrop absolute inset-0" onClick={() => setMobileOpen(false)} />
          <form
            onSubmit={submit}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] space-y-4 overflow-y-auto rounded-t-2xl bg-white p-5 shadow-modal"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Filters</h2>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close filters">
                <i className="ph ph-x text-xl text-slate-400" />
              </button>
            </div>

            <div>
              <label className="label" htmlFor="filter-search-mobile">
                Search by name or type
              </label>
              <input
                id="filter-search-mobile"
                className="field"
                placeholder="Boardroom, desk, studio..."
                value={draft.search}
                onChange={update('search')}
              />
            </div>

            <div>
              <label className="label" htmlFor="filter-type-mobile">
                Space type
              </label>
              <Select
                id="filter-type-mobile"
                ariaLabel="Space type"
                options={TYPE_OPTIONS}
                value={draft.type}
                onChange={setField('type')}
              />
            </div>

            {dateAndCapacityFields}

            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary flex-1">
                Apply filters
              </button>
              <button type="button" className="btn-secondary" onClick={clear}>
                Clear
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
