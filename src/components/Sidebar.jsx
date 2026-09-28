import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../App";

function NavIcon({ name, className = "w-4 h-4 shrink-0" }) {
  switch (name) {
    case "dashboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "careers":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "history":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "assessment":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case "skill-gaps":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M18 17l-5-5-4 4-4-4" />
        </svg>
      );
    case "skill-profile":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
      );
    case "roadmap":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      );
    case "adaptive-roadmap":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
      );
    case "knowledge-refresh":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "insights":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6m-4 4h2m-7-9.5A7 7 0 1118 12.5C16.8 14 16 15 16 16.5v.5H8v-.5c0-1.5-.8-2.5-2-4z" />
        </svg>
      );
    case "profile":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

const mainLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/adaptive-roadmap", label: "Adaptive Roadmap", icon: "adaptive-roadmap" },
  { to: "/skill-profile", label: "Skill Profile", icon: "skill-profile" },
  { to: "/knowledge-refresh", label: "Knowledge Refresh", icon: "knowledge-refresh" },
  { to: "/assessment", label: "Assessments", icon: "assessment" },
  { to: "/learning-history", label: "Learning History", icon: "history" },
  { to: "/careers", label: "Career", icon: "careers" },
  { to: "/profile", label: "Profile", icon: "profile" },
];

export default function Sidebar({ open, onClose }) {
  const { state, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    navigate("/login");
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-ink-950/40 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-line z-50 lg:z-0 transition-transform lg:translate-x-0 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-line shrink-0">
          <Link to="/dashboard" onClick={onClose} className="font-display font-extrabold text-ink-900 text-lg">
            Gap<span className="text-teal-600">Forge</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold text-ink-400 uppercase tracking-wider">
            Navigation
          </div>
          {mainLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onClose}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2.5 focus-ring ${
                  isActive
                    ? "bg-teal-50 text-teal-800 font-semibold border border-teal-200/80"
                    : "text-ink-600 hover:bg-slate-50 hover:text-ink-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <NavIcon
                    name={l.icon}
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-teal-700" : "text-ink-400"
                    }`}
                  />
                  <span>{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Account / SQLite Auth Footer */}
        <div className="p-3 border-t border-line bg-paper/60 shrink-0">
          {state.user ? (
            <div className="p-2 rounded-xl bg-white border border-line shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {state.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink-900 truncate">
                    {state.user.name}
                  </p>
                  <p className="text-[11px] text-ink-500 font-mono truncate">
                    {state.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-line/60">
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                  Active Student
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold transition-colors"
                >
                  Log out →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Link
                to="/login"
                onClick={onClose}
                className="w-full text-center block px-3 py-2 rounded-xl text-xs font-bold border border-line bg-white hover:bg-slate-50 text-ink-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="w-full text-center block px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-2xs"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
