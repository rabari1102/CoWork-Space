import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Alert from './Alert.jsx';
import { readApiError } from '../api/client.js';

const TONES = {
  brand: {
    badge: 'bg-teal-50 text-teal-600 ring-1 ring-teal-200',
    button:
      'rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 hover:from-teal-600 hover:to-cyan-700 transition-all active:scale-[0.98]',
  },
  danger: {
    badge: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
    button:
      'rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-red-700 transition-all active:scale-[0.98]',
  },
};

export default function ConfirmDialog({
  title,
  icon,
  tone = 'brand',
  rows = [],
  note,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const styles = TONES[tone] || TONES.brand;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, submitting]);

  const confirm = async () => {
    setError('');
    setSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(readApiError(err));
      setSubmitting(false);
    }
  };

  const dialogContent = (
    <div
      className="glass-backdrop fixed inset-0 z-[9999] flex animate-fade-in items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200/90 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${styles.badge}`}>
            <i className={`ph ${icon} text-2xl font-bold`} />
          </div>
        )}

        <h3 className="mb-2 text-xl font-extrabold text-navy-900">{title}</h3>

        {rows.length > 0 && (
          <dl className="mb-4 space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-slate-500 font-medium">{row.label}</dt>
                <dd className="text-right font-bold text-navy-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {note && (
          <p className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-800 leading-relaxed font-medium">
            {note}
          </p>
        )}

        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            {cancelLabel}
          </button>
          <button type="button" className={styles.button} onClick={confirm} disabled={submitting}>
            {submitting ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
