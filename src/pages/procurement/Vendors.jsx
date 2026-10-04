import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementApi } from '../../api/procurement';
import { gisApi } from '../../api/gis';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { LocationPickerModal } from '../../components/ui/LocationPickerModal';
import { getErrorMessage } from '../../utils/helpers';

export function Vendors() {
  const { role } = useAuth();
  const qc = useQueryClient();
  const canManage = ['ADMIN','PROC_MANAGER'].includes(role);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [form, setForm] = useState({
    name: '', contactEmail: '', contactPhone: '', locationId: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => procurementApi.getVendors(),
    retry: false,
    onError: (err) => setFetchError(getErrorMessage(err)),
  });

  const { data: locData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => gisApi.getLocations(),
  });

  const locations = (locData?.data?.data || []).map(l => ({
    value: l.id, label: `${l.name} (${l.city})`,
  }));

  const createMutation = useMutation({
    mutationFn: (data) => editing
      ? procurementApi.updateVendor(editing.id, data)
      : procurementApi.createVendor(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      closeModal();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => procurementApi.deactivateVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name:'', contactEmail:'', contactPhone:'', locationId:'' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (vendor) => {
    setEditing(vendor);
    setForm({
      name: vendor.name,
      contactEmail: vendor.contactEmail || '',
      contactPhone: vendor.contactPhone || '',
      locationId: vendor.locationId || '',
    });
    setError('');
    setShowModal(true);

    // prefill selectedLocation if possible from loaded locations
    try {
      const loaded = (locData?.data?.data || []);
      const found = loaded.find(l => String(l.id) === String(vendor.locationId));
      if (found) {
        setSelectedLocation(found);
        return;
      }

      // otherwise fetch the single location from API
      if (vendor.locationId) {
        gisApi.getLocationById(vendor.locationId)
          .then(res => setSelectedLocation(res.data.data))
          .catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setError('');
    setSelectedLocation(null);
  };

  const vendors = data?.data?.data || [];

  const columns = [
    { key: 'name', label: 'Vendor Name' },
    { key: 'contactEmail', label: 'Email' },
    { key: 'contactPhone', label: 'Phone' },
    { key: 'city', label: 'City' },
    {
      key: 'active',
      label: 'Status',
      render: (row) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
          ${row.active
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'}`}>
          {row.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    ...(canManage ? [{
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary"
            onClick={() => openEdit(row)}>
            Edit
          </Button>
          {row.active && (
            <Button size="sm" variant="danger"
              onClick={() => deactivateMutation.mutate(row.id)}>
              Deactivate
            </Button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">
            {vendors.length} registered vendors
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>+ Add Vendor</Button>
        )}
      </div>

      <Card padding={false}>
        <div className="p-6">
          {fetchError && (
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <Alert type="error" message={fetchError} />
              </div>
              <div>
                <Button onClick={() => { setFetchError(''); refetch(); }}>
                  Retry
                </Button>
              </div>
            </div>
          )}
          <Table columns={columns} data={vendors}
            loading={isLoading} emptyText="No vendors yet" />
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editing ? 'Edit Vendor' : 'Add Vendor'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button
              loading={createMutation.isPending}
              onClick={() => {
                // validate selected location has coords when present
                const chosenId = selectedLocation?.id ?? (form.locationId ? parseInt(form.locationId) : null);
                if (chosenId) {
                  // prefer selectedLocation object, otherwise lookup
                  const locObj = selectedLocation || (locData?.data?.data || []).find(l => String(l.id) === String(chosenId));
                  if (!locObj || !locObj.latitude || !locObj.longitude) {
                    setError('Selected location has no coordinates. Please add coordinates or choose a different location.');
                    return;
                  }
                }

                createMutation.mutate({
                  ...form,
                  locationId: chosenId,
                });
              }}
            >
              {editing ? 'Update' : 'Create'} Vendor
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Alert type="error" message={error} />}
          <Input label="Vendor Name" name="name" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required />
          <Input label="Contact Email" name="contactEmail" type="email"
            value={form.contactEmail}
            onChange={e => setForm(p =>
              ({ ...p, contactEmail: e.target.value }))} />
          <Input label="Contact Phone" name="contactPhone"
            value={form.contactPhone}
            onChange={e => setForm(p =>
              ({ ...p, contactPhone: e.target.value }))} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                text-sm bg-gray-50 min-h-[38px] flex items-center">
                {selectedLocation ? (
                  <span className="text-gray-800">
                    {selectedLocation.name} — {selectedLocation.city}
                    {selectedLocation.latitude && (
                      <span className="text-green-600 ml-2 text-xs">✓ coords</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-400">No location selected</span>
                )}
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowLocationPicker(true)}
              >
                {selectedLocation ? 'Change' : 'Select'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        defaultType="vendor_site"
        onSelect={(loc) => {
          setSelectedLocation(loc);
          setShowLocationPicker(false);
        }}
      />
    </div>
  );
}