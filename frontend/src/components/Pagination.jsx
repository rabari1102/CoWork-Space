export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="text-sm text-slate-500">
        Page {page} of {totalPages} &middot; {total} result{total === 1 ? '' : 's'}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          className="btn-secondary px-3 py-1.5"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        {pages.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`h-9 w-9 rounded-lg text-sm font-medium ${
              value === page
                ? 'bg-brand-600 text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          className="btn-secondary px-3 py-1.5"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
