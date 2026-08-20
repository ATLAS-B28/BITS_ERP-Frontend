import { useAuth } from '../../hooks/useAuth';

export function Navbar({ sidebarCollapsed }) {
  const { user } = useAuth();

  return (
    <header className={`fixed top-0 right-0 h-16 bg-white border-b
      border-gray-200 flex items-center justify-between px-6 z-30
      transition-all duration-300
      ${sidebarCollapsed ? 'left-16' : 'left-64'}`}>

      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-gray-700">
          BITS ERP — Retail & Logistics
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* role badge */}
        <span className="text-xs bg-blue-50 text-blue-700 font-medium
          px-2.5 py-1 rounded-full border border-blue-100">
          {user?.role?.replace('_', ' ')}
        </span>

        {/* user avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center
            justify-center text-white text-sm font-semibold">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-700">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}