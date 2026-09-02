import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency, formatDate, getErrorMessage }
  from '../../utils/helpers';

const MODULE_OPTIONS = [
  'INVENTORY','PROCUREMENT','SALES','FINANCE','HR'
].map(m => ({ value: m, label: m }));

export function Budgets() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const canManage = ['ADMIN','FIN_MANAGER'].includes(role);

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', module: '', category: '',
    allocatedAmount: '', periodStart: '', periodEnd: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => financeApi.getBudgets(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => financeApi.createBudget(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
      setShowModal(false);
      setForm({
        name:'', module:'', category:'',
        allocatedAmount:'', periodStart:'', periodEnd:'',
      });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const budgets = data?.data?.data || [];

  const columns = [
    {
      key: 'name',
      label: 'Budget Name',
      render: (row) => (
        <span className="font-medium text-gray-800">{row.name}</span>
      ),
    },
    { key: 'module', label: 'Module' },
    {
      key: 'allocatedAmount',
      label: 'Allocated',
      render: (row) => formatCurrency(row.allocatedAmount),
    },
    {
      key: 'spentAmount',
      label: 'Spent',
      render: (row) => (
        <span className="text-red-600">
          {formatCurrency(row.spentAmount)}
        </span>
      ),
    },
    {
      key: 'remainingAmount',
      label: 'Remaining',
      render: (row) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(row.remainingAmount)}
        </span>
      ),
    },
    {
      key: 'utilization',
      label: 'Utilization',
      render: (row) => {
        const pct = row.allocatedAmount > 0
          ? Math.round((row.spentAmount / row.allocatedAmount) * 100)
          : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full
                  ${pct >= 90 ? 'bg-red-500'
                    : pct >= 70 ? 'bg-yellow-500'
                    : 'bg-green-500'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{pct}%</span>
          </div>
        );
      },
    },
    {
      key: 'period',
      label: 'Period',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {formatDate(row.periodStart)} → {formatDate(row.periodEnd)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} text={row.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Department budgets and utilization
          </p>
        </div>
        {canManage && (
          <Button onClick={() => { setShowModal(true); setError(''); }}>
            + Create Budget
          </Button>
        )}
      </div>

      <Card padding={false}>
        <div className="p-6">
          <Table
            columns={columns}
            data={budgets}
            loading={isLoading}
            emptyText="No budgets created yet"
          />
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); }}
        title="Create Budget"
        footer={
          <>
            <Button variant="secondary"
              onClick={() => { setShowModal(false); setError(''); }}>
              Cancel
            </Button>
            <Button
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate({
                ...form,
                allocatedAmount: parseFloat(form.allocatedAmount),
              })}
            >
              Create Budget
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}
          <Input label="Budget Name" name="name" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required />
          <Select label="Module" name="module" value={form.module}
            onChange={e => setForm(p => ({ ...p, module: e.target.value }))}
            options={MODULE_OPTIONS}
            placeholder="Select module..."
            required />
          <Input label="Category (optional)" name="category"
            value={form.category}
            onChange={e => setForm(p =>
              ({ ...p, category: e.target.value }))}
            placeholder="e.g. raw_materials" />
          <Input label="Allocated Amount (₹)" name="allocatedAmount"
            type="number" value={form.allocatedAmount}
            onChange={e => setForm(p =>
              ({ ...p, allocatedAmount: e.target.value }))}
            required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Period Start" name="periodStart" type="date"
              value={form.periodStart}
              onChange={e => setForm(p =>
                ({ ...p, periodStart: e.target.value }))}
              required />
            <Input label="Period End" name="periodEnd" type="date"
              value={form.periodEnd}
              onChange={e => setForm(p =>
                ({ ...p, periodEnd: e.target.value }))}
              required />
          </div>
        </div>
      </Modal>
    </div>
  );
}