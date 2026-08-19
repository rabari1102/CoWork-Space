import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Logo from '../components/Logo.jsx';
import { readApiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signUp(form);
      toast('Account created. Welcome to CoworkDesk.');
      navigate('/my-bookings', { replace: true });
    } catch (err) {
      setError(readApiError(err, 'Could not create your account'));
      setSubmitting(false);
    }
  };

  return (
    <div className="page flex items-center justify-center py-14">
      <div className="relative w-full max-w-[460px]">
        <div
          className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-200/40 via-cyan-200/30 to-violet-200/30 blur-2xl"
          aria-hidden="true"
        />

        <div className="rounded-[2rem] bg-white p-8 shadow-lift ring-1 ring-slate-200/80 sm:p-10">
          <div className="mb-8 text-center">
            <div className="flex justify-center">
              <Logo showWordmark={false} />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-navy-900">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Join CoworkDesk and start booking in minutes.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className="field"
                required
                minLength={2}
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="field"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              <p className="mt-1.5 text-xs text-slate-500">At least 8 characters.</p>
            </div>

            <Alert>{error}</Alert>

            <button type="submit" className="btn-primary mt-2 w-full py-3" disabled={submitting}>
              {submitting ? (
                <>
                  <i className="ph ph-circle-notch animate-spin" /> Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
