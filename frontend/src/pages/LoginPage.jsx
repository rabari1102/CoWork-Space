import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Logo from '../components/Logo.jsx';
import { readApiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await signIn(form);
      toast(`Welcome back, ${user.name}.`);
      const fallback = user.role === 'admin' ? '/admin/bookings' : '/my-bookings';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(readApiError(err, 'Could not log you in'));
      setSubmitting(false);
    }
  };

  return (
    <div className="page flex items-center justify-center py-14">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-slate-200/80 md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-hero p-10 md:flex">
          <div className="absolute inset-0 bg-grid-navy bg-grid opacity-30" aria-hidden="true" />
          <div
            className="absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <Logo tone="light" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
              Your workspace,
              <br />
              <span className="text-gradient">when you need it.</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">
              Check what is free, reserve a slot, and get on with the work.
            </p>

            <ul className="mt-8 space-y-3">
              {['Real-time availability', 'No double bookings, ever', 'Cancel anytime before it starts'].map(
                (point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-500/20 text-brand-300">
                      <i className="ph ph-check text-xs" />
                    </span>
                    {point}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to manage your bookings.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
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
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </div>

            <Alert>{error}</Alert>

            <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
              {submitting ? (
                <>
                  <i className="ph ph-circle-notch animate-spin" /> Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
