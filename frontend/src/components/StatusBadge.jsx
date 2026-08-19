// Written out in full rather than composed from the status name, because
// Tailwind only ships classes it can find as complete strings in the source.
const STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export default function StatusBadge({ status, size = 'md' }) {
  const scale = size === 'sm' ? 'px-2 py-0.5 text-[10px] uppercase tracking-wider' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium capitalize ring-1 ring-inset ${scale} ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
