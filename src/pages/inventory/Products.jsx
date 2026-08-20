import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';

export function Products() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const canEdit = ['ADMIN','INV_MANAGER'].includes(role);

  const [showCreate, setShowCreate] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    sku: '', name: '', category: '',
    unitPrice: '', unitOfMeasure: 'units', description: '',
  });

  const [stockForm, setStockForm] = useState({
    locationId: '', changeQty: '', reason: 'purchase_order',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => inventoryApi.getProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => inventoryApi.createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      setShowCreate(false);
      setForm({ sku:'',name:'',category:'',unitPrice:'',
                unitOfMeasure:'units',description:'' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryApi.updateStock(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      setShowStock(false);
      setStockForm({ locationId:'', changeQty:'', reason:'purchase_order' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const products = data?.data?.data || [];

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      render: (row) => formatCurrency(row.unitPrice),
    },
    { key: 'unitOfMeasure', label: 'UOM' },
    {
      key: 'active',
      label: 'Status',
      render: (row) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
          ${row.active
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
          }`}>
          {row.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    ...(canEdit ? [{
      key: 'actions',
      label: '',
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelectedProduct(row);
            setShowStock(true);
            setError('');
          }}
        >
          Update Stock
        </Button>
      ),
    }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} products in catalogue
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => { setShowCreate(true); setError(''); }}>
            + Add Product
          </Button>
        )}
      </div>

      <Card padding={false}>
        <div className="p-6">
          <Table
            columns={columns}
            data={products}
            loading={isLoading}
            emptyText="No products yet — add your first product"
          />
        </div>
      </Card>

      {/* create product modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setError(''); }}
        title="Add New Product"
        footer={
          <>
            <Button variant="secondary"
              onClick={() => { setShowCreate(false); setError(''); }}>
              Cancel
            </Button>
            <Button
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate({
                ...form,
                unitPrice: parseFloat(form.unitPrice),
              })}
            >
              Create Product
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" name="sku" value={form.sku} required
              onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
            <Input label="Unit of Measure" name="unitOfMeasure"
              value={form.unitOfMeasure}
              onChange={e => setForm(p =>
                ({ ...p, unitOfMeasure: e.target.value }))} />
          </div>
          <Input label="Product Name" name="name" value={form.name} required
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" name="category" value={form.category}
              onChange={e => setForm(p =>
                ({ ...p, category: e.target.value }))} />
            <Input label="Unit Price (₹)" name="unitPrice" type="number"
              value={form.unitPrice} required
              onChange={e => setForm(p =>
                ({ ...p, unitPrice: e.target.value }))} />
          </div>
          <Input label="Description" name="description"
            value={form.description}
            onChange={e => setForm(p =>
              ({ ...p, description: e.target.value }))} />
        </div>
      </Modal>

      {/* update stock modal */}
      <Modal
        isOpen={showStock}
        onClose={() => { setShowStock(false); setError(''); }}
        title={`Update Stock — ${selectedProduct?.name}`}
        footer={
          <>
            <Button variant="secondary"
              onClick={() => { setShowStock(false); setError(''); }}>
              Cancel
            </Button>
            <Button
              loading={stockMutation.isPending}
              onClick={() => stockMutation.mutate({
                id: selectedProduct.id,
                data: {
                  locationId: parseInt(stockForm.locationId),
                  changeQty: parseInt(stockForm.changeQty),
                  reason: stockForm.reason,
                },
              })}
            >
              Update Stock
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}
          <Input
            label="Location ID"
            name="locationId"
            type="number"
            value={stockForm.locationId}
            onChange={e => setStockForm(p =>
              ({ ...p, locationId: e.target.value }))}
            placeholder="Warehouse location ID"
            required
          />
          <Input
            label="Quantity Change"
            name="changeQty"
            type="number"
            value={stockForm.changeQty}
            onChange={e => setStockForm(p =>
              ({ ...p, changeQty: e.target.value }))}
            placeholder="Positive = stock in, negative = stock out"
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={stockForm.reason}
              onChange={e => setStockForm(p =>
                ({ ...p, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['purchase_order','sale','adjustment','transfer','return']
                .map(r => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}