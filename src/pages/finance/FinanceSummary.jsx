import { useQuery, useMutation } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency } from '../../utils/helpers';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export function FinanceSummary() {
  const { role } = useAuth();
  const canManage = ['ADMIN', 'FIN_MANAGER'].includes(role);
  const [projError, setProjError] = useState('');
  const [projSuccess, setProjSuccess] = useState('');

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => financeApi.getSummary(),
  });

  const { data: projData } = useQuery({
    queryKey: ['projections'],
    queryFn: () => financeApi.getProjections(),
  });

  const calcMutation = useMutation({
    mutationFn: () => financeApi.calculateProjection(3),
    onSuccess: () => setProjSuccess('Projection calculated successfully'),
    onError: () => setProjError('Failed to calculate projection'),
  });

  const fin = summaryData?.data?.data;
  const projections = projData?.data?.data || [];

  const chartData = projections.map(p => ({
    date: p.projectionDate,
    projected: parseFloat(p.projectedAmount || 0),
    actual: parseFloat(p.actualAmount || 0),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Finance Summary
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          P&L overview and revenue projections
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(fin?.totalRevenue || 0)}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          }
        />
        <StatCard
          label="Total Debits"
          value={formatCurrency(fin?.totalDebits || 0)}
          color="red"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17H5m0 0V9m0 8l8-8 4 4 6-6"/>
            </svg>
          }
        />
        <StatCard
          label="Total Credits"
          value={formatCurrency(fin?.totalCredits || 0)}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"/>
            </svg>
          }
        />
        <StatCard
          label="Net Balance"
          value={formatCurrency(fin?.netBalance || 0)}
          color={
            (fin?.netBalance || 0) >= 0 ? 'green' : 'red'
          }
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* budget summary */}
        <Card>
          <CardHeader title="Budget Overview" />
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Allocated</span>
              <span className="font-medium">
                {formatCurrency(fin?.totalBudgetAllocated || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Spent</span>
              <span className="font-medium text-red-600">
                {formatCurrency(fin?.totalBudgetSpent || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t
              border-gray-100 pt-3">
              <span className="text-gray-500">Remaining</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  (fin?.totalBudgetAllocated || 0) -
                  (fin?.totalBudgetSpent || 0)
                )}
              </span>
            </div>
            {/* utilization bar */}
            {fin?.totalBudgetAllocated > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs
                  text-gray-400 mb-1">
                  <span>Utilization</span>
                  <span>
                    {Math.round(
                      (fin.totalBudgetSpent / fin.totalBudgetAllocated) * 100
                    )}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (fin.totalBudgetSpent / fin.totalBudgetAllocated) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* revenue projection chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue Projections"
            action={canManage && (
              <Button
                size="sm"
                loading={calcMutation.isPending}
                onClick={() => calcMutation.mutate()}
              >
                Calculate
              </Button>
            )}
          />
          {projError && (
            <Alert type="error" message={projError}
              onClose={() => setProjError('')} />
          )}
          {projSuccess && (
            <Alert type="success" message={projSuccess}
              onClose={() => setProjSuccess('')} />
          )}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  labelStyle={{ fontSize: 11 }}
                />
                <Legend />
                <Line type="monotone" dataKey="projected"
                  stroke="#3b82f6" strokeWidth={2}
                  dot={false} name="Projected" />
                <Line type="monotone" dataKey="actual"
                  stroke="#10b981" strokeWidth={2}
                  dot={false} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-gray-400">
                No projections yet — click Calculate to generate
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}