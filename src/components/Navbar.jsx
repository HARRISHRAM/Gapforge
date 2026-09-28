import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../App";

export default function Navbar({ onMenuClick }) {
  const { state, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-line bg-paper/95 backdrop-blur flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden focus-ring rounded p-1" aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <Link to="/" className="font-display font-extrabold text-lg text-ink-900">
          Gap<span className="text-teal-600">Forge</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* SQLite Indicator */}
        <span
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
          title="SQLite Database Online (skillpath.db)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          SQLite Active
        </span>

        {state.user ? (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-ink-800 bg-paper border border-line hover:bg-slate-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="max-w-[120px] truncate">{state.user.name}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-ink-800 hover:text-ink-950 border border-line bg-white hover:bg-slate-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-2xs"
            >
              Sign up
            </Link>
          </div>
        )}

        <Link
          to="/dashboard"
          className="text-sm font-semibold text-ink-700 hover:text-ink-900 focus-ring rounded px-2 py-1 ml-1"
        >
          Dashboard
        </Link>
      </div>
    </header>
  );
}
