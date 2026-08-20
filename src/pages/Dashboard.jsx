import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory';
import { procurementApi } from '../api/procurement';
import { salesApi } from '../api/sales';
import { financeApi } from '../api/finance';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate } from '../utils/helpers';

export function Dashboard() {
  const { role } = useAuth();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => inventoryApi.getProducts(),
    enabled: ['ADMIN','INV_MANAGER','INV_EMPLOYEE'].includes(role),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryApi.getLowStock(),
    enabled: ['ADMIN','INV_MANAGER'].includes(role),
  });

  const { data: orders } = useQuery({
    queryKey: ['po-orders'],
    queryFn: () => procurementApi.getOrders(),
    enabled: ['ADMIN','PROC_MANAGER','PROC_EMPLOYEE'].includes(role),
  });

  const { data: salesOrders } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => salesApi.getOrders(),
    enabled: ['ADMIN','SALES_MANAGER','SALES_EMPLOYEE'].includes(role),
  });

  const { data: summary } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => financeApi.getSummary(),
    enabled: ['ADMIN','FIN_MANAGER'].includes(role),
  });

  const productList = products?.data?.data || [];
  const lowStockList = lowStock?.data?.data || [];
  const poList = orders?.data?.data || [];
  const soList = salesOrders?.data?.data || [];
  const fin = summary?.data?.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back — here's what's happening today.
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['ADMIN','INV_MANAGER','INV_EMPLOYEE'].includes(role) && (
          <StatCard
            label="Total Products"
            value={productList.length}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            }
          />
        )}
        {['ADMIN','INV_MANAGER'].includes(role) && (
          <StatCard
            label="Low Stock Items"
            value={lowStockList.length}
            color="red"
            sub="Needs reorder"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            }
          />
        )}
        {['ADMIN','PROC_MANAGER','PROC_EMPLOYEE'].includes(role) && (
          <StatCard
            label="Purchase Orders"
            value={poList.length}
            color="purple"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            }
          />
        )}
        {['ADMIN','SALES_MANAGER','SALES_EMPLOYEE'].includes(role) && (
          <StatCard
            label="Sales Orders"
            value={soList.length}
            color="green"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            }
          />
        )}
        {['ADMIN','FIN_MANAGER'].includes(role) && fin && (
          <StatCard
            label="Net Balance"
            value={formatCurrency(fin.netBalance)}
            color="green"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* recent POs */}
        {['ADMIN','PROC_MANAGER','PROC_EMPLOYEE'].includes(role) && (
          <Card>
            <CardHeader title="Recent Purchase Orders" />
            <div className="flex flex-col gap-3">
              {poList.slice(0, 5).map(po => (
                <div key={po.id}
                  className="flex items-center justify-between py-2
                    border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {po.vendorName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(po.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {formatCurrency(po.totalAmount)}
                    </span>
                    <Badge status={po.status} />
                  </div>
                </div>
              ))}
              {poList.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No purchase orders yet
                </p>
              )}
            </div>
          </Card>
        )}

        {/* recent sales */}
        {['ADMIN','SALES_MANAGER','SALES_EMPLOYEE'].includes(role) && (
          <Card>
            <CardHeader title="Recent Sales Orders" />
            <div className="flex flex-col gap-3">
              {soList.slice(0, 5).map(so => (
                <div key={so.id}
                  className="flex items-center justify-between py-2
                    border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {so.customerName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(so.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {formatCurrency(so.totalAmount)}
                    </span>
                    <Badge status={so.status} />
                  </div>
                </div>
              ))}
              {soList.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No sales orders yet
                </p>
              )}
            </div>
          </Card>
        )}

        {/* low stock */}
        {['ADMIN','INV_MANAGER'].includes(role) && (
          <Card>
            <CardHeader title="Low Stock Alerts" />
            <div className="flex flex-col gap-3">
              {lowStockList.slice(0, 5).map(item => (
                <div key={item.id}
                  className="flex items-center justify-between py-2
                    border-b border-gray-100 last:border-0">
                  <p className="text-sm font-medium text-gray-800">
                    {item.product?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </span>
                    <Badge status="EXCEEDED" text="Low" />
                  </div>
                </div>
              ))}
              {lowStockList.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  All stock levels healthy
                </p>
              )}
            </div>
          </Card>
        )}

        {/* finance summary */}
        {['ADMIN','FIN_MANAGER'].includes(role) && fin && (
          <Card>
            <CardHeader title="Finance Overview" />
            <div className="flex flex-col gap-3">
              {[
                { label: 'Total Revenue', value: fin.totalRevenue, color: 'text-green-600' },
                { label: 'Total Debits', value: fin.totalDebits, color: 'text-red-600' },
                { label: 'Total Credits', value: fin.totalCredits, color: 'text-blue-600' },
                { label: 'Net Balance', value: fin.netBalance, color: 'text-gray-900' },
              ].map(item => (
                <div key={item.label}
                  className="flex items-center justify-between py-2
                    border-b border-gray-100 last:border-0">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className={`text-sm font-semibold ${item.color}`}>
                    {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}