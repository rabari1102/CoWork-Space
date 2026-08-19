import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: 'ph-check-circle', color: 'text-emerald-500' },
  error: { icon: 'ph-warning-circle', color: 'text-rose-500' },
  info: { icon: 'ph-info', color: 'text-brand-500' },
};

const DISMISS_AFTER_MS = 4000;

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
      <div className="pointer-events-none fixed right-0 top-4 z-[70] flex w-full max-w-sm flex-col gap-2 px-4 md:right-4 md:w-[350px] md:px-0">
        {toasts.map((toast) => {
          const tone = TONES[toast.tone] || TONES.info;
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex animate-fade-in items-start gap-3 rounded-lg bg-white p-4 shadow-lg ring-1 ring-slate-200"
            >
              <i className={`ph ${tone.icon} ${tone.color} mt-0.5 shrink-0 text-xl`} />
              <p className="flex-1 pt-0.5 text-sm font-medium text-slate-900">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="ml-2 shrink-0 text-slate-400 hover:text-slate-600"
                aria-label="Dismiss"
              >
                <i className="ph ph-x" />
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
