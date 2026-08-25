import { useQuery } from '@tanstack/react-query';
import { procurementApi } from '../../api/procurement';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';

function getPoNumber(row) {
  return row?.poNumber || row?.poNo || row?.po_no || row?.orderNumber || row?.order_no || row?.referenceNo || row?.reference_no || row?.id || '—';
}

export function PurchaseOrders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['procurement-orders'],
    queryFn: () => procurementApi.getOrders(),
  });

  const orders = data?.data?.data || [];

  const columns = [
    {
      key: 'poNumber',
      label: 'PO No.',
      render: (row) => getPoNumber(row),
    },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'totalAmount', label: 'Total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} text={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Procurement lifecycle and expected payment tracking.</p>
      </div>

      <Card>
        <CardHeader title="Order Log" subtitle="Open, approved, and received purchase orders" />
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error)}</div>
        ) : (
          <Table columns={columns} data={orders} loading={isLoading} emptyText="No purchase orders found." />
        )}
      </Card>
    </div>
  );
}
