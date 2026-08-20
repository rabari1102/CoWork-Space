import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TONES = {
  success: {
    icon: 'ph-check-circle',
    iconColor: 'text-emerald-500',
    bgBadge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    title: 'Success',
  },
  error: {
    icon: 'ph-warning-circle',
    iconColor: 'text-rose-500',
    bgBadge: 'bg-rose-50 text-rose-700 ring-rose-200',
    title: 'Error',
  },
  info: {
    icon: 'ph-info',
    iconColor: 'text-teal-500',
    bgBadge: 'bg-teal-50 text-teal-700 ring-teal-200',
    title: 'Notice',
  },
};

const DISMISS_AFTER_MS = 4500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'success') => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, tone }]);
      setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast: push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-0 top-5 z-[80] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:right-5 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const tone = TONES[t.tone] || TONES.info;
          return (
            <div
              key={t.id}
              role="alert"
              className="pointer-events-auto flex w-full animate-scale-in items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-xl ring-1 ring-black/5"
            >
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ring-1 ${tone.bgBadge}`}>
                <i className={`ph ${tone.icon} text-lg font-bold`} />
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {tone.title}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-navy-900 leading-snug mt-0.5">
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                aria-label="Dismiss notification"
              >
                <i className="ph ph-x text-xs font-bold" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return context;
}

