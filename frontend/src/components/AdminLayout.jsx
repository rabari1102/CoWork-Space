import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/admin/spaces', label: 'Workspace Inventory', icon: 'ph-buildings' },
  { to: '/admin/bookings', label: 'Booking Requests', icon: 'ph-calendar-check' },
];

export default function AdminLayout() {
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    `group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-navy-950 text-white shadow-md shadow-navy-950/20 ring-1 ring-navy-900'
        : 'text-slate-600 hover:bg-slate-100 hover:text-navy-950'
    }`;

  return (
    <div className="page flex w-full flex-col gap-8 lg:flex-row py-6 sm:py-8">
      {/* Sidebar */}
      <aside className="shrink-0 lg:w-64">
        <div className="sticky top-24 space-y-6">
          {/* Admin Header Chip */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-200">
                <i className="ph ph-shield-check text-lg" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Admin Console</p>
                <p className="text-xs text-slate-500">System Management</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:space-y-1 lg:overflow-visible">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                <i className={`ph ${link.icon} text-lg`} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Switch to Public View & User Badge */}
          <div className="hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 lg:block space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
            >
              <i className="ph ph-arrow-left" />
              <span>Back to Public Catalog</span>
            </Link>

            <div className="border-t border-slate-200/80 pt-3 flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-navy-950 text-xs font-bold text-white uppercase">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-navy-900">{user?.name || 'Administrator'}</p>
                <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
