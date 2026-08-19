import { useState } from 'react';
import Select from './Select.jsx';
import { todayIso } from '../utils/format.js';

const TYPE_OPTIONS = [
  { value: '', label: 'Any space' },
  { value: 'desk', label: 'Desk' },
  { value: 'meeting_room', label: 'Meeting room' },
];

/**
 * Landing panel. The search fields map one-to-one onto the filters the API
 * already supports, so submitting here is the same query the filter bar runs.
 */
export default function Hero({ onSearch, stats }) {
  const [draft, setDraft] = useState({ search: '', type: '', date: '', startTime: '', endTime: '' });

  const submit = (event) => {
    event.preventDefault();
    onSearch(draft.date ? draft : { ...draft, startTime: '', endTime: '' });
  };

  return (
    <section className="relative -mx-4 -mt-3 overflow-hidden rounded-b-[2.5rem] bg-hero px-4 pb-16 pt-14 sm:-mx-6 sm:px-6 sm:pt-20 lg:-mx-8 lg:px-8">
      <div className="absolute inset-0 bg-grid-navy bg-grid opacity-[0.35]" aria-hidden="true" />
      <div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute right-1/3 top-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1200px]">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="animate-fade-up text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300">
              Work better. Anywhere.
            </p>

            <h1
              className="mt-5 animate-fade-up text-display font-extrabold text-white"
              style={{ animationDelay: '80ms' }}
            >
              Find a workspace that fits
              <span className="block text-gradient">the way you work.</span>
            </h1>

            <p
              className="mt-5 max-w-xl animate-fade-up text-[17px] leading-relaxed text-slate-300"
              style={{ animationDelay: '160ms' }}
            >
              Browse every desk and meeting room, see exactly what is free on the day you need, and
              reserve your slot in a couple of clicks.
            </p>

            <form
              onSubmit={submit}
              className="mt-9 animate-scale-in rounded-3xl bg-white/95 p-3 shadow-modal ring-1 ring-white/20 backdrop-blur-xl"
              style={{ animationDelay: '240ms' }}
            >
              <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                <div className="flex items-center gap-2 rounded-2xl px-3 py-2 md:border-r md:border-slate-200">
                  <i className="ph ph-magnifying-glass text-lg text-slate-400" />
                  <input
                    type="text"
                    aria-label="Search by name"
                    placeholder="Search by name"
                    className="w-full border-0 bg-transparent p-0 text-sm placeholder:text-slate-400 focus:ring-0"
                    value={draft.search}
                    onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                  />
                </div>

                <div className="md:border-r md:border-slate-200">
                  <Select
                    ariaLabel="Space type"
                    variant="bare"
                    className="w-full"
                    options={TYPE_OPTIONS}
                    value={draft.type}
                    onChange={(value) => setDraft({ ...draft, type: value })}
                  />
                </div>

                <div className="flex items-center gap-2 px-3 py-2">
                  <i className="ph ph-calendar-blank text-lg text-slate-400" />
                  <input
                    type="date"
                    aria-label="Date"
                    min={todayIso()}
                    className="w-full border-0 bg-transparent p-0 text-sm focus:ring-0"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-primary md:px-6">
                  <i className="ph ph-magnifying-glass" />
                  Search
                </button>
              </div>

              {draft.date && (
                <div className="mt-2 grid animate-fade-in grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                  <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500">
                    From
                    <input
                      type="time"
                      aria-label="From"
                      className="w-full border-0 bg-transparent p-0 text-sm text-navy-900 focus:ring-0"
                      value={draft.startTime}
                      onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                    />
                  </label>
                  <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500">
                    To
                    <input
                      type="time"
                      aria-label="To"
                      className="w-full border-0 bg-transparent p-0 text-sm text-navy-900 focus:ring-0"
                      value={draft.endTime}
                      onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                    />
                  </label>
                </div>
              )}
            </form>

            <p
              className="mt-4 animate-fade-up text-xs text-slate-400"
              style={{ animationDelay: '320ms' }}
            >
              No account needed to browse. Sign in when you are ready to book.
            </p>
          </div>

          {/* Floating cards, each showing a real number from the API. */}
          <div className="relative hidden h-[380px] lg:block" aria-hidden="true">
            <div className="absolute left-6 top-4 w-56 animate-float rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                  <i className="ph ph-buildings text-xl" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-slate-400">spaces available</p>
                </div>
              </div>
            </div>

            <div
              className="absolute right-0 top-32 w-52 animate-float rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-xl"
              style={{ animationDelay: '1.2s' }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/20 text-cyan-300">
                  <i className="ph ph-door text-xl" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.rooms}</p>
                  <p className="text-xs text-slate-400">meeting rooms</p>
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-6 left-16 w-60 animate-float rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-xl"
              style={{ animationDelay: '2.4s' }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
                  <i className="ph ph-users-three text-xl" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.largest}</p>
                  <p className="text-xs text-slate-400">seats in the largest room</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
