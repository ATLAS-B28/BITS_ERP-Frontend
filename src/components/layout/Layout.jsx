import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/admin/users': 'User Management',
  '/inventory/products': 'Products',
  '/inventory/low-stock': 'Low Stock',
  '/procurement/vendors': 'Vendors',
  '/procurement/orders': 'Purchase Orders',
  '/sales/customers': 'Customers',
  '/sales/orders': 'Sales Orders',
  '/finance/summary': 'P&L Summary',
  '/finance/ledger': 'Ledger',
  '/finance/budgets': 'Budgets',
  '/gis/map': 'Map View',
  '/gis/warehouse': 'Warehouse Plan',
  '/ai/forecast': 'Forecasting',
  '/ai/chat': 'ERP Assistant',
};

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Overview';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity duration-200 md:hidden ${
          mobileOpen ? 'opacity-100 visible' : 'pointer-events-none invisible opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <Navbar
        sidebarCollapsed={collapsed}
        pageTitle={pageTitle}
        onMenuClick={() => setMobileOpen(true)}
      />

      <main
        className={`min-h-screen pt-16 transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}