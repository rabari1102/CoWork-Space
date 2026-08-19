import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
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
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-modal ring-1 ring-slate-200">
        <div className="hidden w-1/2 flex-col justify-center border-r border-slate-200 bg-slate-50 p-12 md:flex">
          <i className="ph ph-squares-four mb-8 text-5xl text-slate-300" />
          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            Your workspace,
            <br />
            when you need it.
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Book desks and meeting rooms in a few clicks, and let the schedule take care of itself.
          </p>
        </div>

        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to manage your workspace bookings.</p>
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

            <button type="submit" className="btn-primary mt-2 w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
