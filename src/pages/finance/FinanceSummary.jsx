import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';

export function FinanceSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => financeApi.getSummary(),
  });

  const summary = data?.data?.data || {};
  const rows = summary?.projections || [];

  const columns = [
    { key: 'module', label: 'Module' },
    { key: 'label', label: 'Projection' },
    { key: 'current', label: 'Current', render: (row) => formatCurrency(row.current) },
    { key: 'budget', label: 'Budget', render: (row) => formatCurrency(row.budget) },
    { key: 'variance', label: 'Variance', render: (row) => formatCurrency(row.variance) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} text={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Operational overview across finance and budget health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-500">Net Cash Flow</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(summary.netCashFlow)}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Total Budget</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(summary.totalBudget)}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Spent YTD</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(summary.spentYtd)}</div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Summary by Module" subtitle={summary.updatedAt ? `Updated ${formatDate(summary.updatedAt)}` : 'Latest available view'} />
        {error ? (
          <div className="text-sm text-red-600">{getErrorMessage(error)}</div>
        ) : (
          <Table columns={columns} data={rows} loading={isLoading} emptyText="No finance summary data available yet." />
        )}
      </Card>
    </div>
  );
}
