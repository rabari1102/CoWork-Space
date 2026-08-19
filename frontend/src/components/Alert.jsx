const STYLES = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function Alert({ tone = 'error', children }) {
  if (!children) return null;
  return (
    <p className={`rounded-lg border px-3 py-2 text-sm ${STYLES[tone]}`} role="status">
      {children}
    </p>
  );
}
