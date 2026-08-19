import { useState } from 'react';
import DatePicker from './DatePicker.jsx';
import Select from './Select.jsx';
import { todayIso } from '../utils/format.js';

const TYPE_OPTIONS = [
  { value: '', label: 'Any space' },
  { value: 'desk', label: 'Desk' },
  { value: 'meeting_room', label: 'Meeting room' },
];

/**
 * Landing Hero panel with refined Midnight Navy & Teal color combinations,
 * frosted glass stats, and floating search pill.
 */
export default function Hero({ onSearch, stats = { total: 0, rooms: 0, largest: 0 } }) {
  const [draft, setDraft] = useState({ search: '', type: '', date: '', startTime: '', endTime: '' });

  const submit = (event) => {
    event.preventDefault();
    onSearch(draft.date ? draft : { ...draft, startTime: '', endTime: '' });
  };

  return (
    <section className="relative z-30 px-4 pb-24 pt-16 sm:px-6 sm:pt-20 sm:pb-28 lg:px-8">
      {/* Background container with rounded-b and overflow-hidden for ambient background elements */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-[#0a1226] via-[#0c1836] to-[#061424] shadow-2xl pointer-events-none -z-10">
        {/* Ambient glowing radial lights */}
        <div
          className="pointer-events-none absolute -left-20 top-0 h-[450px] w-[450px] rounded-full bg-teal-500/15 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 top-20 h-[480px] w-[480px] rounded-full bg-cyan-500/15 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]"
          aria-hidden="true"
        />

        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-grid-navy bg-grid opacity-15 pointer-events-none" aria-hidden="true" />
      </div>


      <div className="relative mx-auto max-w-[1200px]">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            {/* Live Eyebrow Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-400/30 bg-teal-950/50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-300 shadow-[0_0_20px_-3px_rgba(45,212,191,0.3)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
              </span>
              Work better. Anywhere.
            </div>

            {/* Main Headline */}
            <h1
              className="mt-5 animate-fade-up text-display font-extrabold text-white tracking-tight"
              style={{ animationDelay: '80ms' }}
            >
              Find a workspace that fits
              <span className="block mt-1 bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(45,212,191,0.25)]">
                the way you work.
              </span>
            </h1>

            <p
              className="mt-5 max-w-xl animate-fade-up text-[16px] leading-relaxed text-slate-300/90 font-normal"
              style={{ animationDelay: '160ms' }}
            >
              Browse every desk and meeting room, see exactly what is free on the day you need, and
              reserve your slot in a couple of clicks.
            </p>

            {/* Search Pill Bar */}
            <form
              onSubmit={submit}
              className="relative z-30 mt-9 animate-scale-in rounded-3xl md:rounded-full bg-white p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6),0_0_25px_-5px_rgba(45,212,191,0.15)] ring-1 ring-white/40"
              style={{ animationDelay: '240ms' }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
                {/* 1. Search Query */}
                <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
                  <i className="ph ph-magnifying-glass text-lg text-slate-400 shrink-0" />
                  <input
                    type="text"
                    aria-label="Search by name"
                    placeholder="Search by name..."
                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    value={draft.search}
                    onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                  />
                </div>

                {/* Divider */}
                <div className="hidden md:block h-7 w-px bg-slate-200 shrink-0" aria-hidden="true" />

                {/* 2. Space Type */}
                <div className="flex flex-1 items-center px-3 py-1">
                  <Select
                    ariaLabel="Space type"
                    variant="bare"
                    className="w-full"
                    options={TYPE_OPTIONS}
                    value={draft.type}
                    onChange={(value) => setDraft({ ...draft, type: value })}
                  />
                </div>

                {/* Divider */}
                <div className="hidden md:block h-7 w-px bg-slate-200 shrink-0" aria-hidden="true" />

                {/* 3. Custom DatePicker */}
                <div className="flex flex-1 items-center px-3 py-1">
                  <DatePicker
                    ariaLabel="Date"
                    variant="bare"
                    placeholder="Select date..."
                    min={todayIso()}
                    className="w-full"
                    value={draft.date}
                    onChange={(value) => setDraft({ ...draft, date: value })}
                  />
                </div>

                {/* 4. Search Button */}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl md:rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 active:scale-[0.98] text-white px-7 py-3 text-sm font-bold shadow-lg shadow-teal-500/30 transition-all shrink-0"
                >
                  <i className="ph ph-magnifying-glass text-base font-bold" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            <p
              className="relative z-10 mt-4 animate-fade-up text-xs text-slate-400/90 font-medium"
              style={{ animationDelay: '320ms' }}
            >
              No account needed to browse. Sign in when you are ready to book.
            </p>
          </div>

          {/* Frosted Glass Stat Cards */}
          <div className="relative hidden h-[380px] lg:block" aria-hidden="true">
            {/* Card 1: Verified Spaces */}
            <div className="absolute left-4 top-4 w-60 animate-float rounded-2xl bg-white/[0.08] p-4.5 ring-1 ring-white/20 backdrop-blur-xl shadow-2xl transition hover:bg-white/[0.12]">
              <div className="flex items-center gap-3.5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg shadow-teal-500/25">
                  <i className="ph ph-buildings text-2xl font-bold" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-white tracking-tight leading-none">
                    {stats.total > 0 ? stats.total : '10+'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-300">Verified spaces</p>
                </div>
              </div>
            </div>

            {/* Card 2: Meeting Rooms */}
            <div
              className="absolute right-0 top-32 w-56 animate-float rounded-2xl bg-white/[0.08] p-4.5 ring-1 ring-white/20 backdrop-blur-xl shadow-2xl transition hover:bg-white/[0.12]"
              style={{ animationDelay: '1.2s' }}
            >
              <div className="flex items-center gap-3.5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/25">
                  <i className="ph ph-door text-2xl font-bold" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-white tracking-tight leading-none">
                    {stats.rooms > 0 ? stats.rooms : '6+'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-300">Meeting rooms</p>
                </div>
              </div>
            </div>

            {/* Card 3: Team Spaces / Capacity */}
            <div
              className="absolute bottom-4 left-14 w-64 animate-float rounded-2xl bg-white/[0.08] p-4.5 ring-1 ring-white/20 backdrop-blur-xl shadow-2xl transition hover:bg-white/[0.12]"
              style={{ animationDelay: '2.4s' }}
            >
              <div className="flex items-center gap-3.5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 text-white shadow-lg shadow-violet-500/25">
                  <i className="ph ph-users-three text-2xl font-bold" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-white tracking-tight leading-none">
                    {stats.largest > 0 ? `${stats.largest} Seats` : '16+ Seats'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-300">Largest room capacity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
