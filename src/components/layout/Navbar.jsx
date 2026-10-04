import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Navbar({ sidebarCollapsed, pageTitle, onMenuClick }) {
  const { user } = useAuth();

  return (
    <header
      className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-sm transition-all duration-300 md:px-6 ${
        sidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="hidden h-2.5 w-2.5 rounded-full bg-emerald-500 sm:inline-block" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              BITS ERP
            </p>
            <h1 className="text-sm font-semibold text-slate-800 md:text-base">
              {pageTitle}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700 sm:inline-flex">
          {user?.role?.replace('_', ' ')}
        </span>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">User</p>
            <p className="text-xs font-medium text-slate-700">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}