import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { forecastApi } from '../../api/ai';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatCurrency } from '../../utils/helpers';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

export function ForecastDashboard() {
  const [revPeriods, setRevPeriods] = useState(30);
  const [demandPeriods, setDemandPeriods] = useState(30);

  const { data: revData, isLoading: revLoading, refetch: refetchRev } = useQuery({
    queryKey: ['revenue-forecast', revPeriods],
    queryFn: () => forecastApi.getRevenueForecast(revPeriods),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: () => forecastApi.getInventoryAnalytics(),
  });

  const { data: demandData, isLoading: demandLoading } = useQuery({
    queryKey: ['demand-forecast', demandPeriods],
    queryFn: () => forecastApi.getDemandForecast(null, demandPeriods),
  });

  const revForecast = revData?.data;
  const analytics = analyticsData?.data;
  const demand = demandData?.data;

  // merge historical + forecast for revenue chart
  const revChartData = [
    ...(revForecast?.historical || []).map(h => ({
      date: h.date,
      actual: parseFloat(h.actual || 0),
      type: 'historical',
    })),
    ...(revForecast?.forecast || []).map(f => ({
      date: f.ds,
      forecast: parseFloat(f.yhat || 0),
      upper: parseFloat(f.yhat_upper || 0),
      lower: parseFloat(f.yhat_lower || 0),
      type: 'forecast',
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          AI Forecasting
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Powered by Prophet — demand and revenue predictions
        </p>
      </div>

      {/* inventory analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase
            tracking-wider">
            Total Stock Value
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {analyticsLoading ? '...'
              : formatCurrency(analytics?.total_value || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase
            tracking-wider">
            Total Products
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {analyticsLoading ? '...' : analytics?.total_products || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase
            tracking-wider">
            Categories
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {analyticsLoading ? '...'
              : analytics?.categories?.length || 0}
          </p>
        </div>
      </div>

      {/* category breakdown */}
      {analytics?.categories?.length > 0 && (
        <Card>
          <CardHeader title="Stock Value by Category" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => formatCurrency(v)}
                labelStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="total_value" fill="#3b82f6"
                radius={[4,4,0,0]} name="Stock Value" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* revenue forecast */}
      <Card>
        <CardHeader
          title="Revenue Forecast"
          subtitle={revForecast?.message}
          action={
            <div className="flex items-center gap-2">
              <select
                value={revPeriods}
                onChange={e => setRevPeriods(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-lg
                  px-3 py-1.5 focus:outline-none focus:ring-2
                  focus:ring-blue-500"
              >
                {PERIOD_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          }
        />

        {revLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-gray-400">
              Running Prophet model...
            </p>
          </div>
        ) : (
          <>
            {revForecast?.message?.includes('placeholder') && (
              <div className="mb-4 px-4 py-3 bg-yellow-50 border
                border-yellow-200 rounded-lg text-sm text-yellow-700">
                Add delivered sales orders to generate real forecasts.
                Showing placeholder data.
              </div>
            )}
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revChartData}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0"
                    x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981"
                      stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981"
                      stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0"
                    x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6"
                      stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6"
                      stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }}
                  interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Area type="monotone" dataKey="actual"
                  stroke="#10b981" fill="url(#actualGrad)"
                  strokeWidth={2} name="Actual Revenue"
                  connectNulls={false} />
                <Area type="monotone" dataKey="forecast"
                  stroke="#3b82f6" fill="url(#forecastGrad)"
                  strokeWidth={2} strokeDasharray="5 5"
                  name="Forecasted Revenue" connectNulls={false} />
                <Area type="monotone" dataKey="upper"
                  stroke="#93c5fd" fill="none"
                  strokeWidth={1} strokeDasharray="3 3"
                  name="Upper Bound" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </Card>

      {/* demand forecast */}
      <Card>
        <CardHeader
          title="Product Demand Forecast"
          subtitle="Aggregate demand across all products"
          action={
            <select
              value={demandPeriods}
              onChange={e => setDemandPeriods(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg
                px-3 py-1.5 focus:outline-none focus:ring-2
                focus:ring-blue-500"
            >
              {PERIOD_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          }
        />

        {demandLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-gray-400">
              Running demand model...
            </p>
          </div>
        ) : demand?.error ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-gray-400">{demand.error}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={demand?.forecast || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="ds" tick={{ fontSize: 10 }}
                interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="yhat"
                stroke="#8b5cf6" strokeWidth={2}
                dot={false} name="Forecasted Demand" />
              <Line type="monotone" dataKey="yhat_upper"
                stroke="#c4b5fd" strokeWidth={1}
                strokeDasharray="3 3" dot={false}
                name="Upper Bound" />
              <Line type="monotone" dataKey="yhat_lower"
                stroke="#c4b5fd" strokeWidth={1}
                strokeDasharray="3 3" dot={false}
                name="Lower Bound" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}