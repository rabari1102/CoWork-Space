import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/admin/spaces', label: 'Spaces', icon: 'ph-buildings' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'ph-notebook' },
];

/** Sidebar shell shared by the admin pages; the routes render into the outlet. */
export default function AdminLayout() {
  const linkClass = ({ isActive }) =>
    `group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex w-full flex-col gap-8 md:flex-row">
      <aside className="shrink-0 md:w-64 md:pt-2">
        {/* Horizontal on small screens, a proper sidebar from md up. */}
        <nav className="hide-scroll flex gap-1 overflow-x-auto md:flex-col md:space-y-1 md:overflow-visible">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              <i className={`ph ${link.icon} mr-3 shrink-0 text-lg`} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
