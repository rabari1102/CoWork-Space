import { Link } from 'react-router-dom';
import { SPACE_TYPE_LABELS } from '../utils/format.js';

export default function SpaceCard({ space }) {
  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{space.name}</h3>
        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
          {SPACE_TYPE_LABELS[space.type]}
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-500">
        Seats {space.capacity} {space.capacity === 1 ? 'person' : 'people'}
      </p>

      {space.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{space.description}</p>
      )}

      {space.amenities.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {space.amenities.map((amenity) => (
            <li key={amenity} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {amenity}
            </li>
          ))}
        </ul>
      )}

      <Link to={`/spaces/${space.id}`} className="btn-secondary mt-5 w-full">
        View availability
      </Link>
    </article>
  );
}
