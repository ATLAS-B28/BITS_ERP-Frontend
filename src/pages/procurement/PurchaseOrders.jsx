import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementApi } from '../../api/procurement';
import { inventoryApi } from '../../api/inventory';
import { useAuth } from '../../hooks/useAuth';
import { getPOActions } from '../../utils/erpActions';
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

const REASON_OPTIONS = [
  { value: 'purchase_order', label: 'Purchase Order' },
];

export function PurchaseOrders() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const canCreate = ['ADMIN','PROC_MANAGER','PROC_EMPLOYEE'].includes(role);

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    vendorId: '',
    vendorLatitude: '',
    vendorLongitude: '',
    items: [{ productId: '', quantity: '', unitPrice: '' }],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['po-orders'],
    queryFn: () => procurementApi.getOrders(),
  });

  const { data: vendorData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => procurementApi.getVendors(),
  });

  const { data: productData } = useQuery({
    queryKey: ['products'],
    queryFn: () => inventoryApi.getProducts(),
  });

  const { data: vendorDetailData } = useQuery({
    queryKey: ['vendor-detail', form.vendorId],
    queryFn: () => procurementApi.getVendor(form.vendorId),
    enabled: !!form.vendorId,
  });

  useEffect(() => {
    if (vendorDetailData?.data?.data) {
      const vendor = vendorDetailData.data.data;
      setForm(p => ({
        ...p,
        vendorLatitude: vendor.latitude,
        vendorLongitude: vendor.longitude,
      }));
    }
  }, [vendorDetailData]);

  const vendors = (vendorData?.data?.data || []).map(v => ({
    value: v.id, label: v.name,
  }));

  const products = (productData?.data?.data || []).map(p => ({
    value: p.id, label: `${p.sku} — ${p.name}`,
  }));

  const createMutation = useMutation({
    mutationFn: (data) => procurementApi.createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['po-orders'] });
      setShowCreate(false);
      resetForm();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => {
      const map = {
        submit: procurementApi.submitOrder,
        approve: procurementApi.approveOrder || procurementApi.approvedOrders,
        reject: procurementApi.rejectOrder,
        receive: procurementApi.receiveOrder,
      };

      const handler = map[action];
      if (!handler) {
        throw new Error(`Unsupported purchase order action: ${action}`);
      }

      return handler(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['po-orders'] });
      setShowDetail(false);
    },
    onError: (err) => setError(
      console.log('ACTION ERROR:', err.response?.status, err.response?.data),
      getErrorMessage(err)),
  });

  const resetForm = () => {
    setForm({
      vendorId: '',
      vendorLatitude: '',
      vendorLongitude: '',
      items: [{ productId: '', quantity: '', unitPrice: '' }],
    });
    setError('');
  };

  const addItem = () => setForm(p => ({
    ...p,
    items: [...p.items, { productId: '', quantity: '', unitPrice: '' }],
  }));

  const removeItem = (i) => setForm(p => ({
    ...p,
    items: p.items.filter((_, idx) => idx !== i),
  }));

  const updateItem = (i, field, value) => setForm(p => ({
    ...p,
    items: p.items.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item
    ),
  }));

  const sanitizeItems = (items = []) => items
    .filter(item => item && item.productId !== '' && item.quantity !== '' && item.unitPrice !== '')
    .map(item => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));

  const orders = data?.data?.data || [];

  const columns = [
    {
      key: 'vendorName',
      label: 'Vendor',
      render: (row) => (
        <span className="font-medium text-gray-800">{row.vendorName}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status} text={row.status} />,
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => {
        const actions = getPOActions(row.status, role);
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost"
              onClick={() => { setSelectedPO(row); setShowDetail(true); }}>
              View
            </Button>
            {actions.map(a => (
              <Button key={a.action} size="sm" variant={a.variant}
                loading={actionMutation.isPending}
                onClick={() => actionMutation.mutate({
                  id: row.id, action: a.action
                })}>
                {a.label}
              </Button>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} total orders
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => { setShowCreate(true); setError(''); }}>
            + Create PO
          </Button>
        )}
      </div>
{error && (
  <Alert type="error" message={error} onClose={() => setError('')} />
)}
      <Card padding={false}>
        <div className="p-6">
          <Table columns={columns} data={orders}
            loading={isLoading} emptyText="No purchase orders yet" />
        </div>
      </Card>
      

      {/* Create PO Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); resetForm(); }}
        title="Create Purchase Order"
        size="lg"
        footer={
          <>
            <Button variant="secondary"
              onClick={() => { setShowCreate(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              loading={createMutation.isPending}
              onClick={() => {
                const validItems = sanitizeItems(form.items);

                if (!form.vendorId) {
                  setError('Please select a vendor');
                  return;
                }
                if (validItems.length === 0) {
                  setError('Please add at least one complete item');
                  return;
                }

                createMutation.mutate({
                  vendorId: form.vendorId,
                  vendorLatitude: form.vendorLatitude
                    ? parseFloat(form.vendorLatitude) : null,
                  vendorLongitude: form.vendorLongitude
                    ? parseFloat(form.vendorLongitude) : null,
                  items: validItems,
                });
              }}
            >
              Create PO
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}
          <Select label="Vendor" name="vendorId"
            value={form.vendorId} required
            onChange={e => setForm(p =>
              ({ ...p, vendorId: e.target.value }))}
            options={vendors}
            placeholder="Select vendor..." />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Items
              </label>
              <Button size="sm" variant="secondary" onClick={addItem}>
                + Add Item
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 p-3
                  bg-gray-50 rounded-lg relative">
                  <Select
                    label="Product"
                    name={`product-${i}`}
                    value={item.productId}
                    onChange={e => updateItem(i, 'productId', e.target.value)}
                    options={products}
                    placeholder="Select product..."
                  />
                  <Input label="Quantity" type="number"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    placeholder="Qty" />
                  <Input label="Unit Price (₹)" type="number"
                    value={item.unitPrice}
                    onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                    placeholder="0.00" />
                  {form.items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="absolute top-2 right-2 text-red-400
                        hover:text-red-600 text-xs">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={`PO — ${selectedPO?.vendorName}`}
        size="lg"
      >
        {selectedPO && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge status={selectedPO.status}
                  text={selectedPO.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="font-semibold">
                  {formatCurrency(selectedPO.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Raised By</p>
                <p className="text-sm">{selectedPO.raisedBy || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Approved By</p>
                <p className="text-sm">{selectedPO.approvedBy || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Line Items
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Product','Qty','Unit Price','Total'].map(h => (
                      <th key={h}
                        className="text-left text-xs text-gray-500
                          font-medium py-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items?.map(item => (
                    <tr key={item.id}
                      className="border-b border-gray-100">
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2 font-medium">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}