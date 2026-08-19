export default function Pagination({ pagination, onChange, noun = 'result' }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
      <p className="hidden text-sm text-slate-500 sm:block">
        Showing <span className="font-medium text-slate-900">{total}</span> {noun}
        {total === 1 ? '' : 's'}
      </p>
      <p className="text-sm text-slate-500 sm:hidden">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>

        <div className="hidden gap-1 sm:flex">
          {pages.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              aria-current={value === page ? 'page' : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                value === page
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
