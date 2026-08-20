function getPaginationItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  // If near the start: 1, 2, 3, 4, 5, '...', total
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  // If near the end: 1, '...', total - 4, total - 3, total - 2, total - 1, total
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  // In the middle: 1, '...', current - 1, current, current + 1, '...', total
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function Pagination({ pagination, onChange, noun = 'result' }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;
  const items = getPaginationItems(page, totalPages);

  return (
    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 sm:flex-row">
      <p className="text-xs sm:text-sm text-slate-500 font-medium">
        Showing <span className="font-bold text-navy-900">{total}</span> total {noun}
        {total === 1 ? '' : 's'} (Page <span className="font-bold text-navy-900">{page}</span> of{' '}
        <span className="font-bold text-navy-900">{totalPages}</span>)
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 ring-1 ring-slate-200/80 hover:bg-slate-50 hover:text-navy-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <i className="ph ph-caret-left text-sm" />
          <span>Previous</span>
        </button>

        {/* Numbered Page Buttons with Ellipses */}
        <div className="flex items-center gap-1">
          {items.map((item, idx) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-9 w-7 items-center justify-center text-xs font-bold text-slate-400 select-none"
                >
                  &hellip;
                </span>
              );
            }

            const isCurrent = item === page;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl px-2.5 text-xs sm:text-sm font-bold transition-all ${
                  isCurrent
                    ? 'bg-navy-950 text-white shadow-md shadow-navy-950/20 ring-1 ring-navy-900'
                    : 'text-slate-600 ring-1 ring-slate-200/60 hover:bg-slate-100 hover:text-navy-900'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 ring-1 ring-slate-200/80 hover:bg-slate-50 hover:text-navy-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          <span>Next</span>
          <i className="ph ph-caret-right text-sm" />
        </button>
      </nav>
    </div>
  );
}
