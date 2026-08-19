import { Link } from 'react-router-dom';

/**
 * Shared shell for "nothing here" and "that went wrong". Both need the same
 * shape - a mark, an explanation and one obvious way forward - so they share a
 * component instead of being restyled per page.
 */
export default function EmptyState({
  icon = 'ph-magnifying-glass',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  tone = 'neutral',
}) {
  const mark =
    tone === 'error'
      ? 'bg-rose-50 text-rose-500 ring-rose-100'
      : 'bg-brand-50 text-brand-600 ring-brand-100';

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-8 ${mark}`}>
        <i className={`ph ${icon} text-2xl`} />
      </div>
      <h3 className="mt-5 text-lg font-bold text-navy-900">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      )}

      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
