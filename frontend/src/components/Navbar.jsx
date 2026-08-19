import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function navItems(user) {
  const items = [{ to: '/', label: 'Spaces', end: true }];
  if (user?.role === 'member') {
    items.push({ to: '/my-bookings', label: 'My bookings' });
  }
  if (user?.role === 'admin') {
    items.push({ to: '/admin/spaces', label: 'Admin' });
  }
  return items;
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Any route change closes the drawer, including back/forward navigation.
  useEffect(() => setOpen(false), [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    toast('Successfully signed out.', 'info');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `transition-colors ${isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'}`;

  const roleBadge =
    user?.role === 'admin'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-slate-100 text-slate-600';

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <i className="ph ph-squares-four text-2xl text-brand-600" />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-slate-900">Cowork</span>
              <span className="text-brand-600">Desk</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            {navItems(user).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <div className="mr-1 flex items-center gap-3 border-r border-slate-200 pr-4">
                  <div className="hidden text-right lg:block">
                    <p className="text-xs font-semibold leading-tight text-slate-900">{user.name}</p>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleBadge}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600 ring-1 ring-brand-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                  aria-label="Sign out"
                >
                  <i className="ph ph-sign-out text-lg" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Sign in
                </Link>
                <Link to="/register" className="btn-dark">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-900 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <i className="ph ph-list text-2xl" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="glass-backdrop absolute inset-0" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 right-0 top-0 flex w-64 animate-slide-in-right flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <span className="font-semibold">Menu</span>
              <button type="button" onClick={() => setOpen(false)} className="p-2" aria-label="Close navigation">
                <i className="ph ph-x text-xl text-slate-500" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 font-medium text-slate-600">
              {user && (
                <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600 ring-1 ring-brand-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight text-slate-900">{user.name}</p>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleBadge}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              )}

              {navItems(user).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="border-b border-slate-100 py-2 text-left"
                >
                  {item.label}
                </NavLink>
              ))}

              {user ? (
                <button type="button" onClick={handleSignOut} className="mt-auto pt-8 text-left text-rose-600">
                  <i className="ph ph-sign-out mr-2 inline-block" /> Sign out
                </button>
              ) : (
                <>
                  <Link to="/login" className="border-b border-slate-100 py-2 text-left">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary mt-2">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
