import { Link } from 'react-router-dom';
import { SPACE_TYPE_ICONS, SPACE_TYPE_LABELS } from '../utils/format.js';

const TYPE_BADGES = {
  desk: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  meeting_room: 'bg-brand-50 text-brand-700 ring-brand-700/10',
};

export default function SpaceCard({ space }) {
  const visibleAmenities = space.amenities.slice(0, 3);
  const hiddenCount = space.amenities.length - visibleAmenities.length;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md hover:ring-brand-300">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-600">
            {space.name}
          </h3>
          <span
            className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
              TYPE_BADGES[space.type]
            }`}
          >
            <i className={`ph ${SPACE_TYPE_ICONS[space.type]} mr-1`} />
            {SPACE_TYPE_LABELS[space.type]}
          </span>
        </div>

        {space.description && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600">{space.description}</p>
        )}

        {visibleAmenities.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-1.5">
            {visibleAmenities.map((amenity) => (
              <li key={amenity} className="chip">
                {amenity}
              </li>
            ))}
            {hiddenCount > 0 && <li className="chip text-slate-400">+{hiddenCount}</li>}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <i className="ph ph-users" /> Seats {space.capacity}
          </span>
          <Link
            to={`/spaces/${space.id}`}
            className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-800"
          >
            View availability
            <i className="ph ph-arrow-right ml-1 inline-block transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
