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
    <div className="page flex min-h-[calc(100vh-200px)] items-center justify-center py-8 sm:py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-slate-200/80 md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-hero p-8 md:flex">
          <div className="absolute inset-0 bg-grid-navy bg-grid opacity-30" aria-hidden="true" />
          <div
            className="absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl"
            aria-hidden="true"
          />

          {/* Top Logo */}
          <div className="relative">
            <Logo tone="light" />
          </div>

          {/* Middle Content & Visual Showcase */}
          <div className="relative my-auto py-4">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Welcome back to
              <br />
              <span className="text-gradient">your workspaces.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
              Sign in to view your scheduled slots, book conference rooms, or manage reservations.
            </p>

            {/* Glassmorphic Feature Pill */}
            <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.08] p-3.5 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-md">
                  <i className="ph ph-calendar-check text-xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Live Slot Scheduling</p>
                  <p className="text-[11px] text-slate-300">Instant reservation &amp; check-in</p>
                </div>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5">
              {[
                'Real-time live availability calendar',
                'Zero double bookings guaranteed',
                'High-speed fiber WiFi & AV included',
              ].map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-teal-400/20 text-teal-300">
                    <i className="ph ph-check text-xs font-bold" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Live Status */}
          <div className="relative border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Secure member &amp; admin portal</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to manage your bookings.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
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
                placeholder="member@cowork.test"
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
                placeholder="••••••••"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </div>

            <Alert>{error}</Alert>

            <button type="submit" className="btn-primary mt-2 w-full py-3" disabled={submitting}>
              {submitting ? (
                <>
                  <i className="ph ph-circle-notch animate-spin" /> Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
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
