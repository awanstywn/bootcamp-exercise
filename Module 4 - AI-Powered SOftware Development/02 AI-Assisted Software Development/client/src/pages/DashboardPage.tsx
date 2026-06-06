/**
 * @fileoverview Main landing page after successful login.
 * 
 * Relations:
 * - Consumes: `useDashboardStore`, `lucide-react` icons.
 * - Used by: React Router as the root `/` protected route.
 * 
 * Logic:
 * - Fetches dashboard stats on mount.
 * - Renders a grid of summary cards (Total Products, Total Categories, Low Stock, Active Products).
 */
import { useEffect } from 'react';
import { Package, Tags, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDashboardStore } from '../stores/dashboardStore';

export const DashboardPage = () => {
  const { stats, isLoading, error, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading stats...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  const statCards = [
    { name: 'Total Products', value: stats?.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Categories', value: stats?.totalCategories, icon: Tags, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Low Stock Alerts', value: stats?.lowStock, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Active Products', value: stats?.activeProducts, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome to your product management system.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`shrink-0 rounded-md p-3 ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
