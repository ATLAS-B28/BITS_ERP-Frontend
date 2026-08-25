import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api/sales';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { getErrorMessage } from '../../utils/helpers';

export function Customers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => salesApi.getCustomers(),
  });

  const customers = data?.data?.data || [];

  const columns = [
    { key: 'name', label: 'Customer' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} text={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">Retail and channel customer portfolio.</p>
      </div>

      <Card>
        <CardHeader title="Customer Records" subtitle="Verified customer accounts" />
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error)}</div>
        ) : (
          <Table columns={columns} data={customers} loading={isLoading} emptyText="No customers have been added yet." />
        )}
      </Card>
    </div>
  );
}
