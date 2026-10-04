import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '../../api/sales';
import { inventoryApi } from '../../api/inventory';
import { useAuth } from '../../hooks/useAuth';
import { getSalesOrderActions } from '../../utils/erpActions';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency, formatDate, getErrorMessage }
  from '../../utils/helpers';

export function Orders() {
  const { role } = useAuth();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerId: '',
    deliveryAddress: '',
    deliveryLatitude: '',
    deliveryLongitude: '',
    items: [{ productId: '', quantity: '', unitPrice: '' }],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => salesApi.getOrders(),
  });

  const { data: customerData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => salesApi.getCustomers(),
  });

  // fetch single customer details when a customer is selected
  const { data: customerDetailData } = useQuery({
    queryKey: ['customer-detail', form.customerId],
    queryFn: () => salesApi.getCustomer(form.customerId),
    enabled: !!form.customerId,
  });

  // auto-fill delivery address and coordinates when selected customer changes
  useEffect(() => {
    if (customerDetailData?.data?.data) {
      const customer = customerDetailData.data.data;
      if (customer.latitude && customer.longitude) {
        setForm(p => ({
          ...p,
          deliveryLatitude: customer.latitude,
          deliveryLongitude: customer.longitude,
          deliveryAddress: customer.address || p.deliveryAddress,
        }));
      }
    }
  }, [customerDetailData]);

  const { data: productData } = useQuery({
    queryKey: ['products'],
    queryFn: () => inventoryApi.getProducts(),
  });

  const customers = (customerData?.data?.data || []).map(c => ({
    value: c.id, label: c.name,
  }));

  const products = (productData?.data?.data || []).map(p => ({
    value: p.id, label: `${p.sku} — ${p.name}`,
  }));

  const createMutation = useMutation({
    mutationFn: (data) => salesApi.createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales-orders'] });
      setShowCreate(false);
      resetForm();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => {
      const map = {
        confirm: salesApi.confirmOrder,
        dispatch: salesApi.dispatchOrder,
        deliver: salesApi.deliverOrder,
        cancel: salesApi.cancelOrder,
      };
      return map[action](id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales-orders'] });
      setShowDetail(false);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const resetForm = () => {
    setForm({
      customerId: '', deliveryAddress: '',
      deliveryLatitude: '', deliveryLongitude: '',
      items: [{ productId: '', quantity: '', unitPrice: '' }],
    });
    setError('');
  };

  const addItem = () => setForm(p => ({
    ...p,
    items: [...p.items, { productId: '', quantity: '', unitPrice: '' }],
  }));

  const removeItem = (i) => setForm(p => ({
    ...p, items: p.items.filter((_, idx) => idx !== i),
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
      key: 'customerName',
      label: 'Customer',
      render: (row) => (
        <span className="font-medium text-gray-800">{row.customerName}</span>
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
      key: 'deliveryAddress',
      label: 'Delivery',
      render: (row) => (
        <span className="text-xs text-gray-500">
          {row.deliveryAddress || '—'}
        </span>
      ),
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
        const actions = getSalesOrderActions(row.status, role);
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost"
              onClick={() => {
                setSelectedOrder(row);
                setShowDetail(true);
              }}>
              View
            </Button>
            {actions.map(a => (
              <Button key={a.action} size="sm" variant={a.variant}
                onClick={() => actionMutation.mutate({
                  id: row.id,
                  action: a.action,
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
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} total orders
          </p>
        </div>
        <Button onClick={() => { setShowCreate(true); setError(''); }}>
          + Create Order
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-6">
          <Table columns={columns} data={orders}
            loading={isLoading} emptyText="No sales orders yet" />
        </div>
      </Card>

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); resetForm(); }}
        title="Create Sales Order"
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

                if (!form.customerId) {
                  setError('Please select a customer');
                  return;
                }
                if (validItems.length === 0) {
                  setError('Please add at least one complete item');
                  return;
                }

                createMutation.mutate({
                  customerId: form.customerId,
                  deliveryAddress: form.deliveryAddress,
                  deliveryLatitude: form.deliveryLatitude
                    ? parseFloat(form.deliveryLatitude) : null,
                  deliveryLongitude: form.deliveryLongitude
                    ? parseFloat(form.deliveryLongitude) : null,
                  items: validItems,
                });
              }}
            >
              Create Order
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}
          <Select
            label="Customer"
            name="customerId"
            value={form.customerId}
            required
            onChange={e => {
              const customerId = e.target.value;
              setForm(p => ({ ...p, customerId }));
              // find customer coords from the loaded list
              const customer = (customerData?.data?.data || [])
                .find(c => c.id === customerId);
              if (customer?.latitude && customer?.longitude) {
                setForm(p => ({
                  ...p,
                  customerId,
                  deliveryLatitude: customer.latitude,
                  deliveryLongitude: customer.longitude,
                  deliveryAddress: customer.address || p.deliveryAddress,
                }));
              }
            }}
            options={customers}
            placeholder="Select customer..."
          />
          <Input label="Delivery Address" name="deliveryAddress"
            value={form.deliveryAddress}
            onChange={e => setForm(p =>
              ({ ...p, deliveryAddress: e.target.value }))} />
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-xs text-gray-500 mb-1">
              Delivery coordinates (from customer location)
            </p>
            {form.deliveryLatitude && form.deliveryLongitude ? (
              <p className="text-green-600 font-medium">
                ✓ {form.deliveryLatitude.toFixed(4)}, {form.deliveryLongitude.toFixed(4)}
              </p>
            ) : (
              <p className="text-gray-400 italic">
                Select a customer with a saved location
              </p>
            )}
          </div>

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
                  <Select label="Product"
                    value={item.productId}
                    onChange={e => updateItem(i, 'productId', e.target.value)}
                    options={products}
                    placeholder="Select..." />
                  <Input label="Quantity" type="number"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    placeholder="Qty" />
                  <Input label="Unit Price (₹)" type="number"
                    value={item.unitPrice}
                    onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                    placeholder="0.00" />
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(i)}
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
        title={`Order — ${selectedOrder?.customerName}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge status={selectedOrder.status}
                  text={selectedOrder.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-semibold">
                  {formatCurrency(selectedOrder.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Delivery Address</p>
                <p className="text-sm">
                  {selectedOrder.deliveryAddress || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created By</p>
                <p className="text-sm">{selectedOrder.createdBy || '—'}</p>
              </div>
            </div>

            {/* action buttons in detail view too */}
            {getSalesOrderActions(selectedOrder.status, role).length > 0 && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {getSalesOrderActions(selectedOrder.status, role).map(a => (
                  <Button key={a.action} variant={a.variant}
                    loading={actionMutation.isPending}
                    onClick={() => actionMutation.mutate({
                      id: selectedOrder.id, action: a.action,
                    })}>
                    {a.label}
                  </Button>
                ))}
              </div>
            )}

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
                  {selectedOrder.items?.map(item => (
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