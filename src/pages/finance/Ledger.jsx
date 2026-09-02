import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const TABS = ['ALL', 'DEBIT', 'CREDIT'];

export function Ledger() {
  const [tab, setTab] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['ledger', tab],
    queryFn: () => tab === 'ALL'
      ? financeApi.getLedger()
      : financeApi.getLedgerByType(tab),
  });

  const entries = data?.data?.data || [];

  const totals = entries.reduce((acc, e) => {
    if (e.type === 'DEBIT') acc.debits += parseFloat(e.amount || 0);
    if (e.type === 'CREDIT') acc.credits += parseFloat(e.amount || 0);
    return acc;
  }, { debits: 0, credits: 0 });

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <Badge
          status={row.type === 'DEBIT' ? 'REJECTED' : 'APPROVED'}
          text={row.type}
        />
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className={`font-semibold
          ${row.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
          {row.type === 'DEBIT' ? '−' : '+'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    { key: 'description', label: 'Description' },
    {
      key: 'referenceType',
      label: 'Reference',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.referenceType?.replace('_', ' ').toUpperCase() || '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
        <p className="text-sm text-gray-500 mt-1">
          All financial transactions
        </p>
      </div>

      {/* summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Debits', value: totals.debits, color: 'text-red-600' },
          { label: 'Total Credits', value: totals.credits, color: 'text-green-600' },
          {
            label: 'Net',
            value: totals.credits - totals.debits,
            color: totals.credits - totals.debits >= 0
              ? 'text-green-600' : 'text-red-600',
          },
        ].map(item => (
          <Card key={item.label}>
            <p className="text-xs text-gray-500 font-medium uppercase
              tracking-wider">
              {item.label}
            </p>
            <p className={`text-xl font-bold mt-1 ${item.color}`}>
              {formatCurrency(item.value)}
            </p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        <div className="p-6">
          {/* tabs */}
          <div className="flex items-center gap-2 mb-6">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${tab === t
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <Table
            columns={columns}
            data={entries}
            loading={isLoading}
            emptyText="No ledger entries yet"
          />
        </div>
      </Card>
    </div>
  );
}