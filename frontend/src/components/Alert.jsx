const TONES = {
  error: { wrap: 'bg-rose-50/80 text-rose-800 ring-rose-200/80', icon: 'ph-warning-circle text-rose-600' },
  success: { wrap: 'bg-emerald-50/80 text-emerald-800 ring-emerald-200/80', icon: 'ph-check-circle text-emerald-600' },
  info: { wrap: 'bg-brand-50/70 text-brand-900 ring-brand-200/80', icon: 'ph-info text-brand-600' },
};

export default function Alert({ tone = 'error', children }) {
  if (!children) return null;
  const styles = TONES[tone] || TONES.error;

  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ring-1 shadow-sm transition-all ${styles.wrap}`}
    >
      <i className={`ph ${styles.icon} shrink-0 text-lg leading-none`} />
      <span className="leading-snug">{children}</span>
    </div>
  );
}

