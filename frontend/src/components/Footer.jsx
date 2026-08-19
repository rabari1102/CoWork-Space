import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Footer() {
  const { user } = useAuth();

  // Only routes that exist are listed; a footer full of dead links is worse
  // than a short one.
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Explore spaces', to: '/' },
        user?.role === 'member' && { label: 'My bookings', to: '/my-bookings' },
        user?.role === 'admin' && { label: 'Manage spaces', to: '/admin/spaces' },
        user?.role === 'admin' && { label: 'Booking requests', to: '/admin/bookings' },
      ].filter(Boolean),
    },
    {
      title: 'Account',
      links: user
        ? [{ label: 'Explore spaces', to: '/' }]
        : [
            { label: 'Sign in', to: '/login' },
            { label: 'Create account', to: '/register' },
          ],
    },
  ];

  return (
    <footer className="relative mt-24 bg-navy-950 text-slate-300">
      <div className="gradient-rule absolute inset-x-0 top-0 h-px" />

      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Desks and meeting rooms, bookable by the hour. Check what is free, reserve a slot, and
            get on with the work.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-400" />
            Every booking is confirmed by an admin before it is final.
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {column.title}
            </h2>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 transition-colors hover:text-brand-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row lg:px-8">
          <p>&copy; {new Date().getFullYear()} CoworkDesk</p>
          <p>Built with React, Express and PostgreSQL.</p>
        </div>
      </div>
    </footer>
  );
}
