import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

const ROLES = [
  'INV_MANAGER','INV_EMPLOYEE',
  'PROC_MANAGER','PROC_EMPLOYEE',
  'SALES_MANAGER','SALES_EMPLOYEE',
  'FIN_MANAGER','FIN_EMPLOYEE',
  'VENDOR','LOGISTICS_PARTNER','CUSTOMER',
].map(r => ({ value: r, label: r.replace('_', ' ') }));

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export function UserManagement() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ roleName: '', status: '' });
  const [error, setError] = useState('');

  const { data: allUsers, isLoading: loadingAll } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => authApi.getAllUsers(),
  });

  const { data: pendingUsers, isLoading: loadingPending } = useQuery({
    queryKey: ['users-pending'],
    queryFn: () => authApi.getPendingUsers(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => authApi.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-all'] });
      qc.invalidateQueries({ queryKey: ['users-pending'] });
      setSelected(null);
      setForm({ roleName: '', status: '' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const users = tab === 'pending'
    ? (pendingUsers?.data?.data || [])
    : (allUsers?.data?.data || []);

  const loading = tab === 'pending' ? loadingPending : loadingAll;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className="text-xs font-medium text-gray-600">
          {row.role?.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} text={row.status} />,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelected(row);
            setForm({ roleName: row.role, status: row.status });
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage user roles and access levels
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-6">
          {['all', 'pending'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium
                transition-colors capitalize
                ${tab === t
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {t === 'pending'
                ? `Pending (${pendingUsers?.data?.data?.length || 0})`
                : 'All Users'
              }
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          data={users}
          loading={loading}
          emptyText={tab === 'pending'
            ? 'No pending users'
            : 'No users found'
          }
        />
      </Card>

      {/* edit modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setError(''); }}
        title={`Edit — ${selected?.email}`}
        footer={
          <>
            <Button variant="secondary"
              onClick={() => { setSelected(null); setError(''); }}>
              Cancel
            </Button>
            <Button
              loading={updateMutation.isPending}
              onClick={() => updateMutation.mutate({
                id: selected.id, data: form
              })}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}
          <Select
            label="Role"
            name="roleName"
            value={form.roleName}
            onChange={e => setForm(p => ({ ...p, roleName: e.target.value }))}
            options={ROLES}
            required
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            options={STATUSES}
            required
          />
        </div>
      </Modal>
    </div>
  );
}