import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api/sales';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';

function getOrderNumber(row) {
  return row?.orderNumber || row?.order_no || row?.orderNo || row?.poNumber || row?.referenceNo || row?.reference_no || row?.id || '—';
}

export function Orders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => salesApi.getOrders(),
  });

  const orders = data?.data?.data || [];

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order No.',
      render: (row) => getOrderNumber(row),
    },
    { key: 'customerName', label: 'Customer' },
    { key: 'totalAmount', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} text={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Order pipeline and fulfillment status.</p>
      </div>

      <Card>
        <CardHeader title="Sales Order List" subtitle="Current demand and order health" />
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error)}</div>
        ) : (
          <Table columns={columns} data={orders} loading={isLoading} emptyText="No sales orders found." />
        )}
      </Card>
    </div>
  );
}
