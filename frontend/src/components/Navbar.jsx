import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import ProfileModal from './ProfileModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function navItems(user) {
  const items = [{ to: '/', label: 'Explore', end: true }];
  if (user?.role === 'member') items.push({ to: '/my-bookings', label: 'My bookings' });
  if (user?.role === 'admin') {
    items.push({ to: '/admin/spaces', label: 'Spaces' });
    items.push({ to: '/admin/bookings', label: 'Requests' });
  }
  return items;
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalTab, setModalTab] = useState(null); // 'view' | 'edit' | null
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // The bar tightens and gains opacity once the page moves, so it separates
  // from the hero without ever hiding content behind an opaque block.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast('Signed out.', 'info');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3
     after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-500 after:transition-transform
     after:duration-300 ${
       isActive
         ? 'text-navy-900 after:scale-x-100'
         : 'text-slate-500 hover:text-navy-900 after:scale-x-0 hover:after:scale-x-100'
     }`;

  const roleBadge =
    user?.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-brand-50 text-brand-700';

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
        <nav
          className={`mx-auto flex max-w-[1200px] items-center justify-between gap-4 rounded-2xl px-3 transition-all duration-300 sm:px-4 ${
            scrolled
              ? 'h-14 bg-white/90 shadow-lift ring-1 ring-slate-200/80 backdrop-blur-xl'
              : 'h-16 bg-white/70 shadow-soft ring-1 ring-slate-200/60 backdrop-blur-lg'
          }`}
        >
          <Link to="/" className="shrink-0" aria-label="CoworkDesk home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems(user).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-2xl p-1.5 transition-all hover:bg-slate-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 group"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="hidden text-right lg:block">
                    <p className="text-[13px] font-semibold leading-tight text-navy-900 group-hover:text-brand-600 transition-colors">
                      {user.name}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${roleBadge} rounded px-1.5 py-0.5`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-cyan-500 text-sm font-bold text-white shadow-[0_4px_12px_-4px_rgb(35_181_166/0.6)]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <i
                    className={`ph ph-caret-down text-xs text-slate-400 transition-transform duration-200 ${
                      profileOpen ? 'rotate-180 text-navy-900' : 'group-hover:text-slate-600'
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white p-1.5 shadow-modal ring-1 ring-slate-200/80 backdrop-blur-xl animate-scale-in z-50">
                    <div className="border-b border-slate-100 px-3 py-2.5 mb-1 bg-slate-50/60 rounded-xl">
                      <p className="text-[11px] font-medium text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-navy-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email || 'Account'}</p>
                      <div className="mt-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${roleBadge} rounded px-1.5 py-0.5`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setModalTab('view');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-navy-900"
                      >
                        <i className="ph ph-user text-base text-slate-400" />
                        <span>Profile details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setModalTab('edit');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <i className="ph ph-pencil-simple text-base text-slate-400" />
                        <span>Edit & Update profile</span>
                      </button>

                      {user.role === 'member' && (
                        <Link
                          to="/my-bookings"
                          onClick={() => setProfileOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-navy-900"
                        >
                          <i className="ph ph-calendar-check text-base text-slate-400" />
                          <span>My bookings</span>
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/spaces"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-navy-900"
                          >
                            <i className="ph ph-buildings text-base text-slate-400" />
                            <span>Manage spaces</span>
                          </Link>
                          <Link
                            to="/admin/bookings"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-navy-900"
                          >
                            <i className="ph ph-notebook text-base text-slate-400" />
                            <span>Manage requests</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <i className="ph ph-sign-out text-base" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (

              <>
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl text-navy-800 transition hover:bg-slate-100 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <i className="ph ph-list text-2xl" />
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="glass-backdrop absolute inset-0 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 right-0 top-0 flex w-[80%] max-w-xs animate-slide-in-right flex-col bg-white shadow-modal">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                <i className="ph ph-x text-xl" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              {user && (
                <div className="mb-3 rounded-2xl bg-slate-50 p-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-cyan-500 text-lg font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight text-navy-900">{user.name}</p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${roleBadge} rounded px-1.5 py-0.5`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setModalTab('view');
                      }}
                      className="flex-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      <i className="ph ph-user mr-1" />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setModalTab('edit');
                      }}
                      className="flex-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      <i className="ph ph-pencil-simple mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {navItems(user).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-auto pt-4">
                {user ? (
                  <button type="button" onClick={handleSignOut} className="btn-secondary w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                    <i className="ph ph-sign-out" /> Sign out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className="btn-secondary w-full">
                      Sign in
                    </Link>
                    <Link to="/register" className="btn-primary w-full">
                      Get started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalTab && (
        <ProfileModal
          initialTab={modalTab}
          onClose={() => setModalTab(null)}
        />
      )}
    </>
  );
}

