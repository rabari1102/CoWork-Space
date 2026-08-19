import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function links(user) {
  const items = [{ to: '/', label: 'Spaces', end: true }];
  if (user?.role === 'member') {
    items.push({ to: '/my-bookings', label: 'My bookings' });
  }
  if (user?.role === 'admin') {
    items.push({ to: '/admin/spaces', label: 'Manage spaces' });
    items.push({ to: '/admin/bookings', label: 'Booking requests' });
  }
  return items;
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Cowork<span className="text-brand-600">Desk</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links(user).map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-500">
                {user.name}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide">
                  {user.role}
                </span>
              </span>
              <button type="button" className="btn-secondary" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="space-y-1 border-t border-slate-200 px-4 py-3 md:hidden">
          {links(user).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={navClass}
              onClick={() => setOpen(false)}
            >
              <span className="block">{link.label}</span>
            </NavLink>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <button type="button" className="btn-secondary w-full" onClick={handleSignOut}>
                Sign out ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary flex-1" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
