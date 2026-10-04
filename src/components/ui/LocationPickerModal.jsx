import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gisApi } from '../../api/gis';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Alert } from './Alert';
import { getErrorMessage } from '../../utils/helpers';

const TYPE_OPTIONS = [
  { value: 'vendor_site', label: 'Vendor Site' },
  { value: 'customer_site', label: 'Customer Site' },
  { value: 'store', label: 'Store' },
  { value: 'warehouse', label: 'Warehouse' },
];

async function geocodeAddress(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${
        encodeURIComponent(query)
      }&format=json&limit=1&countrycodes=in`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function LocationPickerModal({ isOpen, onClose, onSelect, defaultType = 'vendor_site' }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [error, setError] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState(null);

  const [newForm, setNewForm] = useState({
    name: '',
    type: defaultType,
    address: '',
    city: '',
    state: '',
    searchQuery: '',
    latitude: '',
    longitude: '',
  });

  const { data: locData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => gisApi.getLocations(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => gisApi.createLocation(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      onSelect(res.data.data);
      onClose();
      resetForm();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const locations = locData?.data?.data || [];

  const handleGeocode = async () => {
    if (!newForm.searchQuery) return;
    setGeocoding(true);
    setGeocodeResult(null);
    const result = await geocodeAddress(newForm.searchQuery + ', India');
    setGeocoding(false);
    if (result) {
      setGeocodeResult(result);
      // parse city and state from display name
      const parts = result.displayName.split(', ');
      setNewForm(p => ({
        ...p,
        latitude: result.lat.toFixed(6),
        longitude: result.lng.toFixed(6),
        address: newForm.searchQuery,
        city: parts[parts.length - 4] || '',
        state: parts[parts.length - 2] || '',
      }));
    } else {
      setError('Location not found — try a more specific address');
    }
  };

  const handleSelectExisting = (loc) => {
    onSelect(loc);
    onClose();
  };

  const resetForm = () => {
    setNewForm({
      name: '', type: defaultType, address: '',
      city: '', state: '', searchQuery: '',
      latitude: '', longitude: '',
    });
    setGeocodeResult(null);
    setError('');
    setMode('existing');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); resetForm(); }}
      title="Select or Add Location"
      size="lg"
      footer={
        mode === 'new' ? (
          <>
            <Button variant="secondary"
              onClick={() => setMode('existing')}>
              ← Back
            </Button>
            <Button
              loading={createMutation.isPending}
              disabled={!newForm.latitude || !newForm.name}
              onClick={() => createMutation.mutate({
                name: newForm.name,
                type: newForm.type,
                address: newForm.address,
                city: newForm.city,
                state: newForm.state,
                latitude: parseFloat(newForm.latitude),
                longitude: parseFloat(newForm.longitude),
              })}
            >
              Create & Select Location
            </Button>
          </>
        ) : (
          <Button variant="secondary"
            onClick={() => { onClose(); resetForm(); }}>
            Cancel
          </Button>
        )
      }
    >
      {error && (
        <Alert type="error" message={error}
          onClose={() => setError('')} />
      )}

      {mode === 'existing' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => handleSelectExisting(loc)}
                className="flex items-center justify-between p-3
                  border border-gray-200 rounded-lg hover:bg-blue-50
                  hover:border-blue-300 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {loc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {loc.city}, {loc.state} · {loc.type?.replace('_', ' ')}
                  </p>
                  {loc.latitude && (
                    <p className="text-xs text-green-600 mt-0.5">
                      ✓ Has coordinates
                    </p>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setMode('new')}
            >
              + Add New Location
            </Button>
          </div>
        </div>
      )}

      {mode === 'new' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Search for an address to auto-fill coordinates
          </p>

          {/* geocode search */}
          <div className="flex gap-2">
            <Input
              label="Search Address / Area"
              name="searchQuery"
              value={newForm.searchQuery}
              onChange={e => setNewForm(p =>
                ({ ...p, searchQuery: e.target.value }))}
              placeholder="e.g. Andheri West Mumbai or Baner Pune"
              className="flex-1"
            />
            <div className="flex items-end">
              <Button
                loading={geocoding}
                onClick={handleGeocode}
                variant="secondary"
              >
                Search
              </Button>
            </div>
          </div>

          {geocodeResult && (
            <div className="p-3 bg-green-50 border border-green-200
              rounded-lg text-sm">
              <p className="text-green-700 font-medium">✓ Location found</p>
              <p className="text-green-600 text-xs mt-1">
                {geocodeResult.displayName}
              </p>
              <p className="text-green-600 text-xs">
                {newForm.latitude}, {newForm.longitude}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Location Name" name="name"
              value={newForm.name}
              onChange={e => setNewForm(p =>
                ({ ...p, name: e.target.value }))}
              placeholder="e.g. Andheri Vendor Hub"
              required />
            <Select label="Type" name="type"
              value={newForm.type}
              onChange={e => setNewForm(p =>
                ({ ...p, type: e.target.value }))}
              options={TYPE_OPTIONS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="City" name="city"
              value={newForm.city}
              onChange={e => setNewForm(p =>
                ({ ...p, city: e.target.value }))} />
            <Input label="State" name="state"
              value={newForm.state}
              onChange={e => setNewForm(p =>
                ({ ...p, state: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" name="latitude"
              type="number"
              value={newForm.latitude}
              onChange={e => setNewForm(p =>
                ({ ...p, latitude: e.target.value }))} />
            <Input label="Longitude" name="longitude"
              type="number"
              value={newForm.longitude}
              onChange={e => setNewForm(p =>
                ({ ...p, longitude: e.target.value }))} />
          </div>
        </div>
      )}
    </Modal>
  );
}