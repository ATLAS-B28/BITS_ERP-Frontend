import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';

export function Budgets() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => financeApi.getBudgets(),
  });

  const budgets = data?.data?.data || [];

  const columns = [
    { key: 'module', label: 'Module' },
    { key: 'allocated', label: 'Allocated', render: (row) => formatCurrency(row.allocated) },
    { key: 'used', label: 'Used', render: (row) => formatCurrency(row.used) },
    { key: 'remaining', label: 'Remaining', render: (row) => formatCurrency(row.remaining) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} text={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <p className="text-sm text-gray-500 mt-1">Track budget allocation and remaining value across modules.</p>
      </div>

      <Card>
        <CardHeader title="Budget Overview" subtitle="Latest approved department budgets" />
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error)}</div>
        ) : (
          <Table columns={columns} data={budgets} loading={isLoading} emptyText="No budgets created yet." />
        )}
      </Card>
    </div>
  );
}
