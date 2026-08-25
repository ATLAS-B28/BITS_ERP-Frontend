import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';

export function Ledger() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ledger'],
    queryFn: () => financeApi.getLedger(),
  });

  const entries = data?.data?.data || [];

  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'reference', label: 'Reference' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'category', label: 'Category' },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} text={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
        <p className="text-sm text-gray-500 mt-1">Recent financial movements and journal entries.</p>
      </div>

      <Card>
        <CardHeader title="Ledger Entries" subtitle="Latest accounting activity" />
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error)}</div>
        ) : (
          <Table columns={columns} data={entries} loading={isLoading} emptyText="No ledger entries available yet." />
        )}
      </Card>
    </div>
  );
}
