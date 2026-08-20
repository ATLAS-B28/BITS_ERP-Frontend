import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// admin
import { UserManagement } from './pages/admin/UserManagement';

// dashboard
import { Dashboard } from './pages/Dashboard';

// inventory
import { Products } from './pages/inventory/Products';
import { LowStock } from './pages/inventory/LowStock';

// procurement
import { Vendors } from './pages/procurement/Vendors';
import { PurchaseOrders } from './pages/procurement/PurchaseOrders';

// sales
import { Customers } from './pages/sales/Customers';
import { Orders } from './pages/sales/Orders';

// finance
import { FinanceSummary } from './pages/finance/FinanceSummary';
import { Ledger } from './pages/finance/Ledger';
import { Budgets } from './pages/finance/Budgets';

// gis
import { MapView } from './pages/gis/MapView';

// misc
import { Unauthorized } from './pages/Unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

const ALL_ROLES = [
  'ADMIN','INV_MANAGER','INV_EMPLOYEE',
  'PROC_MANAGER','PROC_EMPLOYEE',
  'SALES_MANAGER','SALES_EMPLOYEE',
  'FIN_MANAGER','FIN_EMPLOYEE',
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* protected */}
          <Route path="/" element={
            <ProtectedRoute roles={ALL_ROLES}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="dashboard" element={
              <ProtectedRoute roles={ALL_ROLES}>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* admin */}
            <Route path="admin/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } />

            {/* inventory */}
            <Route path="inventory/products" element={
              <ProtectedRoute roles={['ADMIN','INV_MANAGER','INV_EMPLOYEE']}>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="inventory/low-stock" element={
              <ProtectedRoute roles={['ADMIN','INV_MANAGER']}>
                <LowStock />
              </ProtectedRoute>
            } />

            {/* procurement */}
            <Route path="procurement/vendors" element={
              <ProtectedRoute roles={['ADMIN','PROC_MANAGER','PROC_EMPLOYEE']}>
                <Vendors />
              </ProtectedRoute>
            } />
            <Route path="procurement/orders" element={
              <ProtectedRoute roles={['ADMIN','PROC_MANAGER','PROC_EMPLOYEE']}>
                <PurchaseOrders />
              </ProtectedRoute>
            } />

            {/* sales */}
            <Route path="sales/customers" element={
              <ProtectedRoute roles={['ADMIN','SALES_MANAGER','SALES_EMPLOYEE']}>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="sales/orders" element={
              <ProtectedRoute roles={['ADMIN','SALES_MANAGER','SALES_EMPLOYEE']}>
                <Orders />
              </ProtectedRoute>
            } />

            {/* finance */}
            <Route path="finance/summary" element={
              <ProtectedRoute roles={['ADMIN','FIN_MANAGER','FIN_EMPLOYEE']}>
                <FinanceSummary />
              </ProtectedRoute>
            } />
            <Route path="finance/ledger" element={
              <ProtectedRoute roles={['ADMIN','FIN_MANAGER','FIN_EMPLOYEE']}>
                <Ledger />
              </ProtectedRoute>
            } />
            <Route path="finance/budgets" element={
              <ProtectedRoute roles={['ADMIN','FIN_MANAGER']}>
                <Budgets />
              </ProtectedRoute>
            } />

            {/* gis */}
            <Route path="gis/map" element={
              <ProtectedRoute roles={['ADMIN','INV_MANAGER','PROC_MANAGER','SALES_MANAGER']}>
                <MapView />
              </ProtectedRoute>
            } />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}