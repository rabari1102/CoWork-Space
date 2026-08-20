import { Link } from 'react-router-dom';
import SpaceArtwork from './SpaceArtwork.jsx';
import { formatDate } from '../utils/format.js';

/**
 * `availableOn` is only passed when the visitor filtered by a date and time.
 * In that case the API has already guaranteed the space is free for that
 * window, so the badge states a fact rather than a guess.
 */
export default function SpaceCard({ space, availableOn }) {
  const visible = space.amenities.slice(0, 2);
  const hidden = space.amenities.length - visible.length;

  return (
    <Link
      to={`/spaces/${space.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <SpaceArtwork
          space={space}
          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {availableOn && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Free {availableOn}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="text-[16px] font-bold leading-snug tracking-[-0.01em] text-navy-900 transition-colors group-hover:text-brand-600 line-clamp-1">
            {space.name}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <i className="ph ph-users text-sm text-slate-400" />
            <span>Seats {space.capacity}</span>
          </p>

          {space.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
              {space.description}
            </p>
          )}
        </div>

        <div className="mt-3">
          {visible.length > 0 && (
            <ul className="flex flex-wrap gap-1">
              {visible.map((amenity) => (
                <li key={amenity} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-600">
                  {amenity}
                </li>
              ))}
              {hidden > 0 && (
                <li className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-400">
                  +{hidden}
                </li>
              )}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-bold text-brand-600">
            <span>Check availability</span>
            <i className="ph ph-arrow-right text-sm transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SpaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80">
      <div className="skeleton aspect-[16/10] rounded-none" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3.5 w-20" />
        <div className="skeleton h-7 w-full" />
        <div className="flex gap-1 pt-1">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-5 w-14" />
        </div>
        <div className="skeleton mt-2 h-3.5 w-28" />
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
