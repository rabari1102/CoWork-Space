import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="relative mt-24 bg-[#070e1e] text-slate-300">
      <div className="gradient-rule absolute inset-x-0 top-0 h-px" />

      <div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        {/* Brand & Mission Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link
            to="/"
            onClick={(e) => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }}
            className="inline-block"
            aria-label="CoworkDesk home"
          >
            <Logo tone="light" />
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Serviots Technology Private Limited
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Next-generation workspace and meeting room reservation infrastructure. Real-time slot
            availability, intelligent conflict prevention, and seamless booking management.
          </p>

          <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Operating Hours: Monday – Saturday, 10:00 AM to 08:00 PM</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <i className="ph ph-globe text-base text-teal-400 shrink-0" />
              <a
                href="https://serviots.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-teal-300 transition-colors underline underline-offset-2"
              >
                www.serviots.com
              </a>
            </div>
          </div>
        </div>

        {/* Column 1: Workspaces */}
        <div>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Workspaces
          </h2>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link to="/" className="transition-colors hover:text-teal-300">
                All Workspaces
              </Link>
            </li>
            <li>
              <Link to="/?type=desk" className="transition-colors hover:text-teal-300">
                Dedicated &amp; Hot Desks
              </Link>
            </li>
            <li>
              <Link to="/?type=meeting_room" className="transition-colors hover:text-teal-300">
                Meeting Rooms
              </Link>
            </li>
            <li>
              <span className="text-slate-500 cursor-default">High-Speed Fiber WiFi</span>
            </li>
            <li>
              <span className="text-slate-500 cursor-default">4K Displays &amp; AV Setup</span>
            </li>
          </ul>
        </div>

        {/* Column 2: Account & Access */}
        <div>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Portal Access
          </h2>
          <ul className="space-y-2.5 text-sm text-slate-400">
            {user ? (
              <>
                {user.role === 'member' && (
                  <li>
                    <Link to="/my-bookings" className="transition-colors hover:text-teal-300">
                      My Active Bookings
                    </Link>
                  </li>
                )}
                {user.role === 'admin' && (
                  <>
                    <li>
                      <Link to="/admin/spaces" className="transition-colors hover:text-teal-300">
                        Manage Spaces
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/bookings" className="transition-colors hover:text-teal-300">
                        Booking Requests
                      </Link>
                    </li>
                  </>
                )}
                <li className="text-slate-500">
                  Signed in as <span className="text-slate-300 font-medium">{user.name}</span>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="transition-colors hover:text-teal-300">
                    Member Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="transition-colors hover:text-teal-300">
                    Create Member Account
                  </Link>
                </li>
                <li>
                  <span className="text-slate-500">Instant Online Verification</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Column 3: Contact & Company Location */}
        <div>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Headquarters &amp; Contact
          </h2>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <i className="ph ph-map-pin text-base text-teal-400 shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed text-slate-300">
                Dwarkesh Business Hub, 905, Motera, Ahmedabad, Gujarat 380005
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <i className="ph ph-phone text-base text-teal-400 shrink-0" />
              <a href="tel:08780234537" className="text-xs hover:text-teal-300 transition-colors">
                +91 87802 34537
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <i className="ph ph-envelope text-base text-teal-400 shrink-0" />
              <span className="text-xs text-slate-300">contact@serviots.com</span>
            </li>
            <li className="pt-1">
              <a
                href="https://serviots.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-white/20 transition-colors"
              >
                <i className="ph ph-arrow-square-out text-teal-300" /> Visit Serviots.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Legal Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-slate-400 sm:flex-row lg:px-8">
          <p>&copy; {new Date().getFullYear()} Serviots Technology Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Booking Guidelines</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
