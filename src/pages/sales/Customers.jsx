import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '../../api/sales';
import { gisApi } from '../../api/gis';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { LocationPickerModal } from '../../components/ui/LocationPickerModal';
import { Alert } from '../../components/ui/Alert';
import { getErrorMessage } from '../../utils/helpers';

export function Customers() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => salesApi.getCustomers(),
  });

  const { data: locData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => gisApi.getLocations(),
  });

  const locations = (locData?.data?.data || []).map(l => ({
    value: l.id, label: `${l.name} (${l.city})`,
  }));

  const createMutation = useMutation({
    mutationFn: (data) => salesApi.createCustomer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setShowModal(false);
      setForm({ name:'', email:'', phone:'' });
      setSelectedLocation(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const customers = data?.data?.data || [];

  const columns = [
    { key: 'name', label: 'Customer Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {customers.length} registered customers
          </p>
        </div>
        <Button onClick={() => { setShowModal(true); setError(''); }}>
          + Add Customer
        </Button>
      </div>

      <Card padding={false}>
        <div className="p-6">
          <Table columns={columns} data={customers}
            loading={isLoading} emptyText="No customers yet" />
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(''); }}
        title="Add Customer"
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
                locationId: selectedLocation?.id || null,
              })}
            >
              Add Customer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}
          <Input label="Full Name" name="name" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required />
          <Input label="Email" name="email" type="email"
            value={form.email}
            onChange={e => setForm(p =>
              ({ ...p, email: e.target.value }))} />
          <Input label="Phone" name="phone" value={form.phone}
            onChange={e => setForm(p =>
              ({ ...p, phone: e.target.value }))} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 border border-gray-300
                rounded-lg text-sm bg-gray-50 min-h-[38px] flex items-center">
                {selectedLocation ? (
                  <div>
                    <span className="text-gray-800 font-medium">
                      {selectedLocation.name}
                    </span>
                    <span className="text-gray-500 ml-2">
                      — {selectedLocation.city}
                    </span>
                    {selectedLocation.latitude && (
                      <span className="text-green-600 ml-2 text-xs">
                        ✓ coords saved
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">No location selected</span>
                )}
              </div>
              <Button size="sm" variant="secondary"
                onClick={() => setShowLocationPicker(true)}>
                {selectedLocation ? 'Change' : 'Select'}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Location coords auto-fill delivery address on orders
            </p>
          </div>
        </div>
      </Modal>
      {/* location picker modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        defaultType="customer_site"
        onSelect={(loc) => {
          setSelectedLocation(loc);
          setShowLocationPicker(false);
        }}
      />
    </div>
  );
}