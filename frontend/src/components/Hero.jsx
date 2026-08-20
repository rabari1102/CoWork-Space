import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from './CountUp.jsx';
import DatePicker from './DatePicker.jsx';
import Select from './Select.jsx';
import { resolveImageUrl, SPACE_TYPE_ICONS, SPACE_TYPE_LABELS, todayIso } from '../utils/format.js';

const TYPE_OPTIONS = [
  { value: '', label: 'Any space' },
  { value: 'desk', label: 'Desk' },
  { value: 'meeting_room', label: 'Meeting room' },
];

/**
 * Landing Hero panel with Midnight Navy & Teal ambient glow, floating search bar,
 * and an interactive real-time live workspace showcase card with real metrics.
 */
export default function Hero({
  onSearch,
  stats = { total: 50, rooms: 26, desks: 24, largest: 50, totalCapacity: 280 },
  inventory = [],
}) {
  const [draft, setDraft] = useState({ search: '', type: '', date: '', startTime: '', endTime: '' });
  const [selectedFeaturedIndex, setSelectedFeaturedIndex] = useState(0);

  const submit = (event) => {
    event.preventDefault();
    onSearch(draft.date ? draft : { ...draft, startTime: '', endTime: '' });
  };

  // Strictly showcase 2 spaces: 1 Desk and 1 Meeting Room
  const featuredSpaces = useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return [
        {
          id: 1,
          name: 'Hot Desk Alpha-1',
          label: 'Desk',
          type: 'desk',
          capacity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
          description: 'Sunlit desk near the south window bays with dual power sockets and high-speed fiber WiFi.',
        },
        {
          id: 25,
          name: 'Meeting Room Zen',
          label: 'Meeting Room',
          type: 'meeting_room',
          capacity: 4,
          imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
          description: 'Quiet meeting room with warm wood slats, 4K screen, and conference camera.',
        },
      ];
    }

    const desk = inventory.find((s) => s.type === 'desk') || inventory[0];
    const room = inventory.find((s) => s.type === 'meeting_room') || inventory[1];

    return [
      { ...desk, label: 'Desk' },
      { ...room, label: 'Meeting Room' },
    ];
  }, [inventory]);

  const activeSpace = featuredSpaces[selectedFeaturedIndex] || featuredSpaces[0];

  return (
    <section className="relative z-30 px-4 pb-20 pt-14 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
      {/* Ambient background container */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-[#0a1226] via-[#0c1836] to-[#061424] shadow-2xl pointer-events-none -z-10">
        {/* Ambient glowing lights */}
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
        <div className="absolute inset-0 bg-grid-navy bg-grid opacity-15 pointer-events-none" aria-hidden="true" />
      </div>

      <div className="relative mx-auto max-w-[1240px]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12">
          {/* Left Column: Heading & Search */}
          <div>
            {/* Main Headline */}
            <h1
              className="animate-fade-up text-display font-extrabold text-white tracking-tight"
              style={{ animationDelay: '80ms' }}
            >
              Find a workspace that fits
              <span className="block mt-1 bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(45,212,191,0.25)]">
                the way you work.
              </span>
            </h1>

            <p
              className="mt-4 max-w-xl animate-fade-up text-[15px] sm:text-[16px] leading-relaxed text-slate-300/90 font-normal"
              style={{ animationDelay: '160ms' }}
            >
              Browse all {stats.total || 50} verified desks and meeting rooms, see real-time slot availability,
              and reserve your space with instant confirmation.
            </p>

            {/* Search Pill Bar */}
            <form
              onSubmit={submit}
              className="relative z-30 mt-8 animate-scale-in rounded-3xl md:rounded-full bg-white p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6),0_0_25px_-5px_rgba(45,212,191,0.15)] ring-1 ring-white/40"
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

                {/* 3. Custom Date & Time Picker */}
                <div className="flex flex-1 items-center px-3 py-1">
                  <DatePicker
                    ariaLabel="Date and time"
                    variant="bare"
                    placeholder="Select date & time..."
                    min={todayIso()}
                    className="w-full"
                    value={draft.date}
                    onChange={(value) => setDraft({ ...draft, date: value })}
                    startTime={draft.startTime}
                    onStartTimeChange={(time) => setDraft((curr) => ({ ...curr, startTime: time }))}
                    endTime={draft.endTime}
                    onEndTimeChange={(time) => setDraft((curr) => ({ ...curr, endTime: time }))}
                    showTime={true}
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

            {/* Quick Filter Tags: Desks and Meeting Rooms Only */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300/80">
              <span className="text-slate-400 font-medium">Quick filter:</span>
              <button
                type="button"
                onClick={() => onSearch({ search: '', type: 'desk', date: '', startTime: '', endTime: '' })}
                className="rounded-full bg-white/10 px-3 py-1 font-medium hover:bg-white/20 transition-colors text-white"
              >
                Desks ({stats.desks || 24})
              </button>
              <button
                type="button"
                onClick={() => onSearch({ search: '', type: 'meeting_room', date: '', startTime: '', endTime: '' })}
                className="rounded-full bg-white/10 px-3 py-1 font-medium hover:bg-white/20 transition-colors text-white"
              >
                Meeting Rooms ({stats.rooms || 26})
              </button>
            </div>
          </div>

          {/* Right Column: Sleek, Smooth Workspace Showcase Card */}
          <div className="relative hidden lg:block">
            {/* Ambient subtle glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-teal-500/20 via-cyan-500/15 to-transparent blur-xl opacity-70" />

            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-3.5 shadow-2xl backdrop-blur-xl">
              {/* Featured Space Image with Clean Overlays */}
              {activeSpace && (() => {
                const fallbackImg =
                  activeSpace.type === 'desk'
                    ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
                    : 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80';
                const imgSrc = resolveImageUrl(activeSpace.imageUrl) || fallbackImg;

                return (
                  <Link
                    to={`/spaces/${activeSpace.id}`}
                    className="group relative block aspect-[16/11] overflow-hidden rounded-2xl ring-1 ring-white/20 transition-all duration-500 hover:ring-teal-400/60"
                  >
                    <img
                      src={imgSrc}
                      alt={activeSpace.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImg;
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/75 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-md ring-1 ring-white/15 shadow-sm">
                        <i className={`ph ${SPACE_TYPE_ICONS[activeSpace.type]} text-teal-400`} />
                        {SPACE_TYPE_LABELS[activeSpace.type]} &bull; {activeSpace.capacity} {activeSpace.capacity === 1 ? 'Seat' : 'Seats'}
                      </span>
                    </div>

                    <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      Available Today
                    </span>

                    {/* Bottom Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight transition-colors group-hover:text-teal-300">
                            {activeSpace.name}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-300">
                            {activeSpace.description}
                          </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition-colors group-hover:bg-teal-400 group-hover:text-navy-950">
                          View Space
                          <i className="ph ph-arrow-right text-xs" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })()}

              {/* Bottom Clean Interactive Switcher & Live Stats Strip */}
              <div className="mt-3.5 flex items-center justify-between px-2 pt-1">
                {/* 2 Space switcher pills: Desk & Meeting Room */}
                <div className="flex items-center gap-1.5">
                  {featuredSpaces.map((sp, idx) => (
                    <button
                      key={sp.id || idx}
                      type="button"
                      onClick={() => setSelectedFeaturedIndex(idx)}
                      className={`rounded-lg px-3.5 py-1 text-xs font-medium transition-all ${
                        selectedFeaturedIndex === idx
                          ? 'bg-white/25 text-white font-bold ring-1 ring-white/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>

                {/* Minimal Live Venue Metric */}
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-bold text-white">{stats.total || 50}</span> Spaces
                  <span className="text-slate-500">&bull;</span>
                  <span className="font-bold text-teal-300">{stats.desks || 24}</span> Desks
                  <span className="text-slate-500">&bull;</span>
                  <span className="font-bold text-cyan-300">{stats.rooms || 26}</span> Meeting Rooms
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
