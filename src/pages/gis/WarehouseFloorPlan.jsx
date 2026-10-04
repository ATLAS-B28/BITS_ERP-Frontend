import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gisApi } from '../../api/gis';
import { inventoryApi } from '../../api/inventory';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/helpers';

// Zone definitions — maps product categories to warehouse zones
const ZONE_CONFIG = [
  { id: 'A', label: 'Zone A', color: 'bg-blue-100 border-blue-300', 
    textColor: 'text-blue-800', position: 'col-span-1' },
  { id: 'B', label: 'Zone B', color: 'bg-green-100 border-green-300',
    textColor: 'text-green-800', position: 'col-span-1' },
  { id: 'C', label: 'Zone C', color: 'bg-purple-100 border-purple-300',
    textColor: 'text-purple-800', position: 'col-span-1' },
  { id: 'D', label: 'Zone D', color: 'bg-orange-100 border-orange-300',
    textColor: 'text-orange-800', position: 'col-span-1' },
];

function StockBar({ quantity, reorderLevel, max }) {
  const pct = max > 0 ? Math.min((quantity / max) * 100, 100) : 0;
  const isLow = quantity <= reorderLevel;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full transition-all duration-500
          ${isLow ? 'bg-red-500' : pct > 60 ? 'bg-green-500' : 'bg-yellow-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ZoneCard({ zone, products, isSelected, onClick }) {
  const totalQty = products.reduce((s, p) => s + p.quantity, 0);
  const hasLow = products.some(p => p.quantity <= p.reorderLevel);
  const maxQty = Math.max(...products.map(p => p.quantity), 1);

  return (
    <div
      onClick={onClick}
      className={`border-2 rounded-xl p-4 cursor-pointer transition-all
        duration-200 hover:shadow-md
        ${zone.color}
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`font-bold text-sm ${zone.textColor}`}>
          {zone.label}
        </span>
        {hasLow && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5
            rounded-full font-medium animate-pulse">
            LOW
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-gray-800">{totalQty}</p>
      <p className="text-xs text-gray-500 mb-3">total units</p>

      {products.slice(0, 3).map(p => (
        <div key={p.product?.id || p.id} className="mb-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 truncate max-w-[120px]">
              {p.product?.name || 'Product'}
            </span>
            <span className="font-medium text-gray-800">{p.quantity}</span>
          </div>
          <StockBar
            quantity={p.quantity}
            reorderLevel={p.reorderLevel}
            max={maxQty}
          />
        </div>
      ))}

      {products.length > 3 && (
        <p className="text-xs text-gray-400 mt-1">
          +{products.length - 3} more products
        </p>
      )}

      {products.length === 0 && (
        <p className="text-xs text-gray-400 italic">Empty zone</p>
      )}
    </div>
  );
}

export function WarehouseFloorPlan() {
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const { data: locData } = useQuery({
    queryKey: ['locations-warehouse'],
    queryFn: () => gisApi.getByType('warehouse'),
  });

  const { data: invData, isLoading } = useQuery({
    queryKey: ['inventory-by-location', selectedWarehouse],
    queryFn: () => {
          console.log('Fetching for warehouse:', selectedWarehouse);
    return inventoryApi.getByLocation(selectedWarehouse);},
    enabled: !!selectedWarehouse,
    refetchInterval: 30000, // live update every 30s
  });

  const warehouses = locData?.data?.data || [];
  const inventory = invData?.data?.data || [];

  // distribute inventory items across zones
  const distributeToZones = (items) => {
    const zones = { A: [], B: [], C: [], D: [] };
    items.forEach((item, i) => {
      const zoneKey = ['A', 'B', 'C', 'D'][i % 4];
      zones[zoneKey].push(item);
    });
    return zones;
  };

  const zoneData = distributeToZones(inventory);
  const totalQty = inventory.reduce((s, i) => s + i.quantity, 0);
  const lowStockCount = inventory.filter(
    i => i.quantity <= i.reorderLevel
  ).length;

  const selectedZoneProducts = selectedZone
    ? zoneData[selectedZone] || []
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Warehouse Floor Plan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Live 2D inventory visualization — updates every 30 seconds
        </p>
      </div>

      {/* warehouse selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {warehouses.map(w => (
          <button
            key={w.id}
            onClick={() => {
              setSelectedWarehouse(w.id);
              setSelectedZone(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium
              transition-colors border
              ${selectedWarehouse === w.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            {w.name}
          </button>
        ))}
        {warehouses.length === 0 && (
          <p className="text-sm text-gray-400">
            No warehouses found — add locations with type "warehouse"
          </p>
        )}
      </div>

      {selectedWarehouse && (
        <>
          {/* warehouse stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Total Stock
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalQty} units
              </p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Product Lines
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {inventory.length}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Low Stock Alerts
              </p>
              <p className={`text-2xl font-bold mt-1
                ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {lowStockCount}
              </p>
            </Card>
          </div>

          {/* floor plan */}
          <Card padding={false}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">
                  Floor Layout
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"/>
                    Healthy
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                    Medium
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"/>
                    Low Stock
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <p className="text-sm text-gray-400">
                    Loading warehouse data...
                  </p>
                </div>
              ) : (
                <div className="border-2 border-gray-300 rounded-xl
                  overflow-hidden">
                  {/* receiving + dispatch bays */}
                  <div className="grid grid-cols-2 bg-gray-700 text-white
                    text-xs font-medium">
                    <div className="flex items-center justify-center py-2
                      border-r border-gray-600 gap-2">
                      <span>⬇</span> RECEIVING BAY
                    </div>
                    <div className="flex items-center justify-center py-2
                      gap-2">
                      DISPATCH BAY <span>⬆</span>
                    </div>
                  </div>

                  {/* zones grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4
                    bg-gray-50">
                    {ZONE_CONFIG.map(zone => (
                      <ZoneCard
                        key={zone.id}
                        zone={zone}
                        products={zoneData[zone.id] || []}
                        isSelected={selectedZone === zone.id}
                        onClick={() => setSelectedZone(
                          selectedZone === zone.id ? null : zone.id
                        )}
                      />
                    ))}
                  </div>

                  {/* aisle label */}
                  <div className="bg-gray-200 text-center text-xs
                    text-gray-500 py-1 font-medium">
                    ← MAIN AISLE →
                  </div>

                  {/* storage area */}
                  <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50">
                    {[...Array(8)].map((_, i) => (
                      <div key={i}
                        className="h-4 bg-gray-300 rounded opacity-40"/>
                    ))}
                  </div>

                  {/* office area */}
                  <div className="bg-gray-100 text-center text-xs
                    text-gray-400 py-1.5">
                    OFFICE / ADMIN
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* zone detail panel */}
          {selectedZone && (
            <Card>
              <CardHeader
                title={`Zone ${selectedZone} — Product Details`}
                action={
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕ Close
                  </button>
                }
              />
              {selectedZoneProducts.length === 0 ? (
                <p className="text-sm text-gray-400">No products in this zone</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2
                  lg:grid-cols-3 gap-4">
                  {selectedZoneProducts.map(item => {
                    const isLow = item.quantity <= item.reorderLevel;
                    return (
                      <div key={item.id}
                        className={`p-4 rounded-xl border
                          ${isLow
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-white'
                          }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              SKU: {item.product?.sku || '—'}
                            </p>
                          </div>
                          {isLow && (
                            <Badge status="EXCEEDED" text="Low" />
                          )}
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {item.quantity}
                            </p>
                            <p className="text-xs text-gray-400">
                              units · reorder at {item.reorderLevel}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            {formatCurrency(
                              item.product?.unitPrice * item.quantity
                            )}
                          </p>
                        </div>
                        <StockBar
                          quantity={item.quantity}
                          reorderLevel={item.reorderLevel}
                          max={item.quantity + item.reorderLevel}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {!selectedWarehouse && warehouses.length > 0 && (
        <Card>
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-400">
              Select a warehouse above to view its floor plan
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}