/**
 * @file AdminDashboardPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for AdminDashboardPage operations.
 * 
 * @relations
 * Interacts with: react, ../../lib/apiClient, ../../lib/routes, ../../lib/currency, lucide-react.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useEffect, useState } from "react";
import apiClient from "../../lib/apiClient";
import { API_ROUTES } from "../../lib/routes";
import { formatPrice } from "../../lib/currency";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app we might have a dedicated /admin/stats endpoint
    // For now we'll construct it from orders and products
    async function fetchDashboardStats() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          apiClient.get(`${API_ROUTES.ADMIN.ORDERS}?limit=100`),
          apiClient.get(`${API_ROUTES.ADMIN.PRODUCTS}?limit=1`)
        ]);

        const orders = ordersRes.data.data.orders || [];
        
        // Calculate basic stats
        const totalRevenue = orders
          .filter((o: any) => o.status !== "CANCELED")
          .reduce((sum: number, o: any) => sum + Number(o.total), 0);
          
        const activeOrders = orders.filter((o: any) => ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING"].includes(o.status)).length;
        
        setStats({
          totalRevenue,
          totalOrders: ordersRes.data.data.pagination.total,
          activeOrders,
          totalProducts: productsRes.data.data.pagination.total,
          recentOrders: orders.slice(0, 5)
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;
  }

  const statCards = [
    { name: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { name: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Active Orders", value: stats?.activeOrders || 0, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
    { name: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your marketplace performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No orders yet.</td>
                </tr>
              ) : (
                stats?.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link to={`/admin/orders`} className="hover:text-blue-600">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' : 
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                          order.status === 'CANCELED' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
