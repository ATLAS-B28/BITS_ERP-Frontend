import { useQuery } from '@tanstack/react-query';
import { procurementApi } from '../../api/procurement';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { getErrorMessage } from '../../utils/helpers';

export function Vendors() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => procurementApi.getVendors(),
  });

  const vendors = data?.data?.data || [];

  const columns = [
    { key: 'name', label: 'Vendor' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} text={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-sm text-gray-500 mt-1">Approved supplier and service partner records.</p>
      </div>

      <Card>
        <CardHeader title="Vendor Directory" subtitle="Active and inactive suppliers" />
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error)}</div>
        ) : (
          <Table columns={columns} data={vendors} loading={isLoading} emptyText="No vendors have been added yet." />
        )}
      </Card>
    </div>
  );
}
