import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ title, subtitle, onClose, footer, width = 'max-w-xl', children }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    // Prevent background body scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const modalContent = (
    <div
      className="glass-backdrop fixed inset-0 z-[9999] flex animate-fade-in items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative my-auto flex max-h-[88vh] w-full ${width} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200/90 animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/90">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-navy-900 leading-tight">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-200/60 hover:text-navy-900 transition-colors shrink-0"
            aria-label="Close"
          >
            <i className="ph ph-x text-lg font-bold" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>

        {/* Optional Modal Footer */}
        {footer && (
          <div className="shrink-0 flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
