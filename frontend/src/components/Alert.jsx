const TONES = {
  error: { wrap: 'bg-rose-50 text-rose-700 ring-rose-200', icon: 'ph-warning-circle' },
  success: { wrap: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: 'ph-check-circle' },
  info: { wrap: 'bg-brand-50 text-brand-800 ring-brand-200', icon: 'ph-info' },
};

export default function Alert({ tone = 'error', children }) {
  if (!children) return null;
  const styles = TONES[tone];

  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-lg p-3 text-xs ring-1 ${styles.wrap}`}
    >
      <i className={`ph ${styles.icon} mt-0.5 shrink-0 text-base`} />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}
