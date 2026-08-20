import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap }
  from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { gisApi } from '../../api/gis';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

// fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// custom icons per type
const icons = {
  warehouse: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  vendor_site: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  store: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
};

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 10);
  }, [lat, lng, map]);
  return null;
}

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'vendor_site', label: 'Vendor Site' },
  { value: 'store', label: 'Store' },
  { value: 'customer_site', label: 'Customer Site' },
];

export function MapView() {
  const [filterType, setFilterType] = useState('');
  const [nearbyForm, setNearbyForm] = useState({
    latitude: '18.5204',
    longitude: '73.8567',
    radiusKm: '50',
    type: '',
  });
  const [nearbyResults, setNearbyResults] = useState(null);
  const [showNearby, setShowNearby] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['locations', filterType],
    queryFn: () => filterType
      ? gisApi.getByType(filterType)
      : gisApi.getLocations(),
  });

  const nearbyMutation = useMutation({
    mutationFn: () => gisApi.findNearby(
      parseFloat(nearbyForm.latitude),
      parseFloat(nearbyForm.longitude),
      parseFloat(nearbyForm.radiusKm),
      nearbyForm.type || null
    ),
    onSuccess: (res) => setNearbyResults(res.data.data),
  });

  const locations = data?.data?.data || [];
  const displayLocations = nearbyResults || locations;

  // center of India as default
  const center = [20.5937, 78.9629];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GIS Map View</h1>
        <p className="text-sm text-gray-500 mt-1">
          Warehouses, vendor sites and stores across your supply chain
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* sidebar controls */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Filter" />
            <Select
              label="Location Type"
              name="type"
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value);
                setNearbyResults(null);
              }}
              options={TYPE_OPTIONS}
            />
          </Card>

          <Card>
            <CardHeader title="Nearby Search" />
            <div className="flex flex-col gap-3">
              <Input
                label="Latitude"
                name="latitude"
                type="number"
                value={nearbyForm.latitude}
                onChange={e => setNearbyForm(p =>
                  ({ ...p, latitude: e.target.value }))}
              />
              <Input
                label="Longitude"
                name="longitude"
                type="number"
                value={nearbyForm.longitude}
                onChange={e => setNearbyForm(p =>
                  ({ ...p, longitude: e.target.value }))}
              />
              <Input
                label="Radius (km)"
                name="radiusKm"
                type="number"
                value={nearbyForm.radiusKm}
                onChange={e => setNearbyForm(p =>
                  ({ ...p, radiusKm: e.target.value }))}
              />
              <Select
                label="Filter Type"
                name="nearbyType"
                value={nearbyForm.type}
                onChange={e => setNearbyForm(p =>
                  ({ ...p, type: e.target.value }))}
                options={TYPE_OPTIONS}
              />
              <Button
                loading={nearbyMutation.isPending}
                onClick={() => nearbyMutation.mutate()}
                className="w-full"
              >
                Find Nearby
              </Button>
              {nearbyResults && (
                <Button
                  variant="secondary"
                  onClick={() => setNearbyResults(null)}
                  className="w-full"
                >
                  Clear Results
                </Button>
              )}
            </div>
          </Card>

          {/* legend */}
          <Card>
            <CardHeader title="Legend" />
            <div className="flex flex-col gap-2">
              {[
                { type: 'warehouse', color: 'bg-blue-500', label: 'Warehouse' },
                { type: 'vendor_site', color: 'bg-green-500', label: 'Vendor Site' },
                { type: 'store', color: 'bg-orange-500', label: 'Store' },
                { type: 'customer_site', color: 'bg-purple-500', label: 'Customer Site' },
              ].map(item => (
                <div key={item.type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* map */}
        <div className="lg:col-span-3">
          <Card padding={false}>
            <div className="h-[600px] rounded-xl overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full
                  bg-gray-100">
                  <p className="text-sm text-gray-400">Loading map...</p>
                </div>
              ) : (
                <MapContainer
                  center={center}
                  zoom={5}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {nearbyResults && nearbyForm.latitude && nearbyForm.longitude && (
                    <>
                      <RecenterMap
                        lat={parseFloat(nearbyForm.latitude)}
                        lng={parseFloat(nearbyForm.longitude)}
                      />
                      <Circle
                        center={[
                          parseFloat(nearbyForm.latitude),
                          parseFloat(nearbyForm.longitude),
                        ]}
                        radius={parseFloat(nearbyForm.radiusKm) * 1000}
                        pathOptions={{
                          color: '#3b82f6',
                          fillColor: '#3b82f6',
                          fillOpacity: 0.1,
                        }}
                      />
                    </>
                  )}

                  {displayLocations
                    .filter(loc => loc.latitude && loc.longitude)
                    .map(loc => (
                      <Marker
                        key={loc.id}
                        position={[loc.latitude, loc.longitude]}
                        icon={icons[loc.type] || icons.warehouse}
                      >
                        <Popup>
                          <div className="min-w-[160px]">
                            <p className="font-semibold text-gray-800 mb-1">
                              {loc.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize mb-1">
                              {loc.type?.replace('_', ' ')}
                            </p>
                            {loc.address && (
                              <p className="text-xs text-gray-600">
                                {loc.address}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {loc.city}, {loc.state}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>
              )}
            </div>
          </Card>

          {/* results list */}
          {nearbyResults && (
            <Card className="mt-4">
              <CardHeader
                title={`${nearbyResults.length} locations found nearby`}
              />
              <div className="flex flex-col gap-2">
                {nearbyResults.map(loc => (
                  <div key={loc.id}
                    className="flex items-center justify-between py-2
                      border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {loc.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {loc.city}, {loc.state}
                      </p>
                    </div>
                    <Badge
                      text={loc.type?.replace('_', ' ')}
                      status={loc.active ? 'ACTIVE' : 'SUSPENDED'}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}