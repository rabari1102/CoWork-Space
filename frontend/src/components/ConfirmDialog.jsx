import { useEffect, useState } from 'react';
import Alert from './Alert.jsx';
import { readApiError } from '../api/client.js';

const TONES = {
  brand: { badge: 'bg-brand-50 text-brand-600', button: 'btn-primary' },
  danger: { badge: 'bg-rose-50 text-rose-600', button: 'btn-danger' },
};

/**
 * Confirmation step for anything the user cannot undo: requesting a booking,
 * cancelling one, or an admin approving or rejecting a request. `rows` is a
 * label/value summary of what is about to happen.
 */
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
  const styles = TONES[tone];

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, submitting]);

  const confirm = async () => {
    setError('');
    setSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      // Keep the dialog open so the reason stays next to the action.
      setError(readApiError(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-backdrop fixed inset-0 z-[60] flex animate-fade-in items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
      >
        {icon && (
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.badge}`}>
            <i className={`ph ${icon} text-2xl`} />
          </div>
        )}

        <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>

        {rows.length > 0 && (
          <dl className="mb-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-slate-500">{row.label}</dt>
                <dd className="text-right font-medium text-slate-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {note && (
          <p className="mb-4 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
            {note}
          </p>
        )}

        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            {cancelLabel}
          </button>
          <button type="button" className={styles.button} onClick={confirm} disabled={submitting}>
            {submitting ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
