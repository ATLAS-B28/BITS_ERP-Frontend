import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';

export function LowStock() {
  const { data, isLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryApi.getLowStock(),
  });

  const items = data?.data?.data || [];

  const columns = [
    { key: 'product', label: 'Product',
      render: (row) => row.product?.name || '-' },
    { key: 'location', label: 'Warehouse',
      render: (row) => row.location?.name || '-' },
    { key: 'quantity', label: 'Current Qty' },
    { key: 'reorderLevel', label: 'Reorder Level' },
    {
      key: 'deficit',
      label: 'Deficit',
      render: (row) => (
        <span className="text-red-600 font-semibold">
          {row.reorderLevel - row.quantity}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-50 rounded-lg">
          <svg className="w-5 h-5 text-red-600" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Low Stock Alerts
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} below reorder level
          </p>
        </div>
      </div>

      <Card padding={false}>
        <div className="p-6">
          <Table
            columns={columns}
            data={items}
            loading={isLoading}
            emptyText="All stock levels are healthy"
          />
        </div>
      </Card>
    </div>
  );
}