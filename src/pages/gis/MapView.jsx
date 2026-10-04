import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MapContainer, TileLayer, Marker, Popup,
  Circle, useMap, CircleMarker
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { gisApi } from '../../api/gis';
import { procurementApi } from '../../api/procurement';
import { inventoryApi } from '../../api/inventory';
import { salesApi } from '../../api/sales';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';

// fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// custom colored icons
const makeIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const icons = {
  warehouse: makeIcon('blue'),
  vendor_site: makeIcon('green'),
  store: makeIcon('orange'),
  customer_site: makeIcon('violet'),
  truck: makeIcon('yellow'),
};

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 8);
  }, [lat, lng, map]);
  return null;
}

// pulsing circle for low stock warehouses
function PulsingMarker({ position, color, children }) {
  return (
    <CircleMarker
      center={position}
      radius={18}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 2,
      }}
    >
      {children}
    </CircleMarker>
  );
}

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'vendor_site', label: 'Vendor Site' },
  { value: 'store', label: 'Store' },
  { value: 'customer_site', label: 'Customer Site' },
];

const SOURCE_OPTIONS = [
  { value: 'sales', label: 'Sales Orders' },
  { value: 'procurement', label: 'Purchase Orders (PO)' },
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
  const [showLayers, setShowLayers] = useState({
    locations: true,
    stock: true,
    deliveries: true,
  });

  // locations
  const { data: locData, isLoading } = useQuery({
    queryKey: ['locations', filterType],
    queryFn: () => filterType
      ? gisApi.getByType(filterType)
      : gisApi.getLocations(),
  });

  // stock summary per location — live every 30s
  const { data: stockData } = useQuery({
    queryKey: ['stock-summary-location'],
    queryFn: () => inventoryApi.getStockSummaryByLocation(),
    refetchInterval: 30000,
  });

  // dispatched orders for truck markers — live every 30s
  const [dispatchedSource, setDispatchedSource] = useState('sales'); // 'sales' | 'procurement'
  const dispatchedQueryKey = ['dispatched-orders', dispatchedSource];
  const dispatchedQueryFn = () => dispatchedSource === 'sales'
    ? salesApi.getDispatchedForMap()
    : procurementApi.getDispatchedForMap();
  const [dispatchedFetchError, setDispatchedFetchError] = useState('');
  const { data: dispatchedData, error: dispatchedError, refetch: refetchDispatched } = useQuery({
    queryKey: dispatchedQueryKey,
    queryFn: dispatchedQueryFn,
    refetchInterval: 30000,
    retry: false,
    onError: (err) => setDispatchedFetchError(getErrorMessage(err)),
  });

  // auto-fallback: if sales source fails, try procurement once automatically
  useEffect(() => {
    if (dispatchedFetchError && dispatchedSource === 'sales') {
      setDispatchedSource('procurement');
      setDispatchedFetchError('');
    }
  }, [dispatchedFetchError, dispatchedSource]);

  const nearbyMutation = {
    isPending: false,
    mutate: async () => {
      const res = await gisApi.findNearby(
        parseFloat(nearbyForm.latitude),
        parseFloat(nearbyForm.longitude),
        parseFloat(nearbyForm.radiusKm),
        nearbyForm.type || null
      );
      setNearbyResults(res.data.data);
    }
  };

  const locations = locData?.data?.data || [];
  const stockSummary = stockData?.data?.data || [];
  const dispatchedOrders = dispatchedData?.data?.data || [];
  const displayLocations = nearbyResults || locations;

  // animated truck positions: keyed by order.id -> { lat, lng }
  const [truckPositions, setTruckPositions] = useState({});
  const animRefs = useRef({});
  const truckPositionsRef = useRef({});

  // keep a ref in sync so animations read latest positions without
  // creating stale-closure bugs in the RAF effect
  useEffect(() => { truckPositionsRef.current = truckPositions; }, [truckPositions]);

  // build stock lookup by locationId
  const stockMap = stockSummary.reduce((acc, s) => {
    acc[s.locationId] = s;
    return acc;
  }, {});

  const center = [20.5937, 78.9629];

  // Animate truck markers smoothly between updates.
  useEffect(() => {
    const defaultDuration = 28000; // 28s to roughly match 30s refetch
    const initialDuration = 6000; // shorter so first-seen movement is visible
    const initialOffset = 0.02; // degrees offset for demo animation on first-seen

    // cancel and clear any animations for orders that no longer exist
    const currentIds = new Set(dispatchedOrders.map(o => o.id));
    Object.keys(animRefs.current).forEach(id => {
      if (!currentIds.has(id)) {
        cancelAnimationFrame(animRefs.current[id]?.rafId);
        delete animRefs.current[id];
      }
    });

    dispatchedOrders.forEach(order => {
      const id = String(order.id);
      const target = { lat: order.deliveryLatitude, lng: order.deliveryLongitude };

      const existing = truckPositionsRef.current[id];

      // compute animation params: if first-seen, animate from a small offset so movement is visible
      const isFirstSeen = !existing;
      const from = isFirstSeen
        ? { lat: target.lat + initialOffset, lng: target.lng + initialOffset }
        : { lat: existing.lat, lng: existing.lng };
      const to = target;
      const duration = isFirstSeen ? initialDuration : defaultDuration;

      // if already animating to same target, skip
      if (animRefs.current[id] && animRefs.current[id].toLat === to.lat && animRefs.current[id].toLng === to.lng) {
        return;
      }

      // initialize visible position for first-seen before animating
      if (isFirstSeen) {
        setTruckPositions(prev => ({ ...prev, [id]: from }));
      }

      const start = performance.now();

      // cancel previous
      if (animRefs.current[id]) cancelAnimationFrame(animRefs.current[id].rafId);

      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = t; // linear; could swap easing
        const lat = from.lat + (to.lat - from.lat) * eased;
        const lng = from.lng + (to.lng - from.lng) * eased;
        setTruckPositions(prev => ({ ...prev, [id]: { lat, lng } }));

        if (t < 1) {
          animRefs.current[id].rafId = requestAnimationFrame(step);
        } else {
          // finished
          delete animRefs.current[id];
        }
      }

      animRefs.current[id] = { rafId: requestAnimationFrame(step), toLat: to.lat, toLng: to.lng };
    });

    return () => {
      // cleanup all rafs
      Object.values(animRefs.current).forEach(r => r && r.rafId && cancelAnimationFrame(r.rafId));
      animRefs.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatchedOrders]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GIS Map View</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live supply chain map — stock levels and delivery tracking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* controls */}
        <div className="flex flex-col gap-4">
          {/* layer toggles */}
          <Card>
            <CardHeader title="Map Layers" />
            <div className="flex flex-col gap-2">
              {[
                { key: 'locations', label: 'Locations' },
                { key: 'stock', label: 'Stock Pulse' },
                { key: 'deliveries', label: 'Deliveries' },
              ].map(layer => (
                <label key={layer.key}
                  className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLayers[layer.key]}
                    onChange={e => setShowLayers(p => ({
                      ...p, [layer.key]: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{layer.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* filter */}
          <Card>
            <CardHeader title="Filter" />
            <div className="flex flex-col gap-3">
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

              <Select
                label="Delivery Source"
                name="dispatchedSource"
                value={dispatchedSource}
                onChange={e => setDispatchedSource(e.target.value)}
                options={SOURCE_OPTIONS}
              />
            </div>
          </Card>

          {/* nearby search */}
          <Card>
            <CardHeader title="Nearby Search" />
            <div className="flex flex-col gap-3">
              <Input label="Latitude" type="number"
                value={nearbyForm.latitude}
                onChange={e => setNearbyForm(p =>
                  ({ ...p, latitude: e.target.value }))} />
              <Input label="Longitude" type="number"
                value={nearbyForm.longitude}
                onChange={e => setNearbyForm(p =>
                  ({ ...p, longitude: e.target.value }))} />
              <Input label="Radius (km)" type="number"
                value={nearbyForm.radiusKm}
                onChange={e => setNearbyForm(p =>
                  ({ ...p, radiusKm: e.target.value }))} />
              <Select label="Type" value={nearbyForm.type}
                onChange={e => setNearbyForm(p =>
                  ({ ...p, type: e.target.value }))}
                options={TYPE_OPTIONS} />
              <Button
                onClick={nearbyMutation.mutate}
                className="w-full">
                Find Nearby
              </Button>
              {nearbyResults && (
                <Button variant="secondary"
                  onClick={() => setNearbyResults(null)}
                  className="w-full">
                  Clear ({nearbyResults.length} found)
                </Button>
              )}
            </div>
          </Card>

          {/* legend */}
          <Card>
            <CardHeader title="Legend" />
            <div className="flex flex-col gap-2 text-sm">
              {[
                { color: 'bg-blue-500', label: 'Warehouse' },
                { color: 'bg-green-500', label: 'Vendor Site' },
                { color: 'bg-orange-500', label: 'Store' },
                { color: 'bg-violet-500', label: 'Customer Site' },
                { color: 'bg-yellow-500', label: 'In Delivery' },
              ].map(item => (
                <div key={item.label}
                  className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}/>
                  <span className="text-gray-600">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-red-500 
                  animate-pulse"/>
                <span className="text-gray-600">Low Stock Warning</span>
              </div>
            </div>
          </Card>

          {/* live stats */}
          <Card>
            <CardHeader title="Live Stats" />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Locations</span>
                <span className="font-medium">{locations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">In Delivery</span>
                <span className="font-medium text-yellow-600">
                  {dispatchedOrders.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Low Stock Sites</span>
                <span className="font-medium text-red-600">
                  {stockSummary.filter(s => s.hasLowStock).length}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Auto-refreshes every 30s
              </p>
            </div>
          </Card>
        </div>

        {/* map */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card padding={false}>
            <div className="h-[580px] rounded-xl overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full
                  bg-gray-100">
                  <p className="text-sm text-gray-400">Loading map...</p>
                </div>
              ) : (
                <MapContainer center={center} zoom={5}
                  className="h-full w-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {nearbyResults && nearbyForm.latitude && (
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
                          fillOpacity: 0.08,
                        }}
                      />
                    </>
                  )}

                  {/* location markers */}
                  {showLayers.locations && displayLocations
                    .filter(loc => loc.latitude && loc.longitude)
                    .map(loc => {
                      const stock = stockMap[loc.id];
                      const hasLowStock = stock?.hasLowStock;

                      return (
                        <div key={loc.id}>
                          {/* pulsing red ring for low stock */}
                          {showLayers.stock && hasLowStock && (
                            <PulsingMarker
                              position={[loc.latitude, loc.longitude]}
                              color="#ef4444"
                            >
                              <Popup>
                                <p className="font-semibold text-red-600">
                                  ⚠ Low Stock Warning
                                </p>
                                <p className="text-xs">{loc.name}</p>
                              </Popup>
                            </PulsingMarker>
                          )}

                          <Marker
                            position={[loc.latitude, loc.longitude]}
                            icon={icons[loc.type] || icons.warehouse}
                          >
                            <Popup>
                              <div className="min-w-[180px]">
                                <p className="font-semibold text-gray-800">
                                  {loc.name}
                                </p>
                                <p className="text-xs text-gray-500
                                  capitalize mb-2">
                                  {loc.type?.replace('_', ' ')}
                                </p>
                                {loc.address && (
                                  <p className="text-xs text-gray-600 mb-1">
                                    {loc.address}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {loc.city}, {loc.state}
                                </p>
                                {stock && loc.type !== 'customer_site' && (
                                  <div className="mt-2 pt-2 border-t
                                    border-gray-100">
                                    <p className="text-xs font-medium
                                      text-gray-700">
                                      Stock: {stock.totalQuantity} units
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {stock.productCount} product lines
                                    </p>
                                    {hasLowStock && (
                                      <p className="text-xs text-red-600
                                        font-medium mt-1">
                                        ⚠ Low stock alert
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Popup>
                          </Marker>
                        </div>
                      );
                    })}

                  {/* delivery truck markers */}
                  {showLayers.deliveries && (
                    <>
                      {dispatchedFetchError && (
                        <div className="absolute top-4 right-4 z-50">
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                            <p className="text-sm text-yellow-800">{dispatchedFetchError}</p>
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" onClick={() => refetchDispatched()}>Retry</Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {dispatchedOrders
                        .filter(o => o.deliveryLatitude && o.deliveryLongitude)
                        .map(order => {
                      const id = String(order.id);
                      const pos = truckPositions[id] || {
                        lat: order.deliveryLatitude,
                        lng: order.deliveryLongitude,
                      };

                      return (
                        <Marker
                          key={order.id}
                          position={[pos.lat, pos.lng]}
                          icon={icons.truck}
                        >
                          <Popup>
                            <div className="min-w-[160px]">
                              <p className="font-semibold text-yellow-700">
                                🚚 In Delivery
                              </p>
                              <p className="text-xs text-gray-700 mt-1">
                                Customer: {order.customerName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {order.deliveryAddress}
                              </p>
                              <p className="text-xs font-medium text-gray-800
                                mt-1">
                                {formatCurrency(order.totalAmount)}
                              </p>
                              <Badge status="DISPATCHED"
                                text="DISPATCHED" />
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                    </>
                  )}
                </MapContainer>
              )}
            </div>
          </Card>

          {/* nearby results */}
          {nearbyResults && nearbyResults.length > 0 && (
            <Card>
              <CardHeader
                title={`${nearbyResults.length} locations within ${nearbyForm.radiusKm}km`}
              />
              <div className="grid grid-cols-2 gap-3">
                {nearbyResults.map(loc => {
                  const stock = stockMap[loc.id];
                  return (
                    <div key={loc.id}
                      className="flex items-center justify-between
                        p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {loc.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {loc.city} · {loc.type?.replace('_', ' ')}
                        </p>
                        {stock && loc.type !== 'customer_site' && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {stock.totalQuantity} units
                          </p>
                        )}
                      </div>
                      {stock?.hasLowStock && (
                        <span className="text-xs bg-red-100 text-red-600
                          px-2 py-0.5 rounded-full animate-pulse">
                          LOW
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}