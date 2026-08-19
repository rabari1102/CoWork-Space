import { Link } from 'react-router-dom';
import SpaceArtwork from './SpaceArtwork.jsx';
import { formatDate } from '../utils/format.js';

/**
 * `availableOn` is only passed when the visitor filtered by a date and time.
 * In that case the API has already guaranteed the space is free for that
 * window, so the badge states a fact rather than a guess.
 */
export default function SpaceCard({ space, availableOn }) {
  const visible = space.amenities.slice(0, 3);
  const hidden = space.amenities.length - visible.length;

  return (
    <Link
      to={`/spaces/${space.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift hover:ring-brand-300/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SpaceArtwork
          space={space}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {availableOn && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free {availableOn}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[19px] font-bold leading-snug tracking-[-0.01em] text-navy-900 transition-colors group-hover:text-brand-600">
          {space.name}
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <i className="ph ph-users text-base" />
          Seats {space.capacity}
        </p>

        {space.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {space.description}
          </p>
        )}

        {visible.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {visible.map((amenity) => (
              <li key={amenity} className="chip">
                {amenity}
              </li>
            ))}
            {hidden > 0 && <li className="chip text-slate-400">+{hidden}</li>}
          </ul>
        )}

        <span className="mt-5 inline-flex items-center gap-1.5 border-t border-slate-100 pt-4 text-sm font-semibold text-brand-600">
          Check availability
          <i className="ph ph-arrow-right transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function SpaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80">
      <div className="skeleton aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-4 w-full" />
        <div className="flex gap-1.5 pt-1">
          <div className="skeleton h-6 w-20" />
          <div className="skeleton h-6 w-16" />
        </div>
        <div className="skeleton mt-4 h-4 w-32" />
      </div>
    </div>
  );
}

/** Date label for the availability badge, e.g. "today" or "21 Aug". */
export function availabilityLabel(date, startTime, endTime) {
  if (!date) return null;
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const day = date === todayIso ? 'today' : formatDate(date);
  return startTime && endTime ? `${day}, ${startTime}-${endTime}` : day;
}
