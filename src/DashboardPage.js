// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Users, Store, DollarSign, Clock, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const STATUS_COLORS = {
  RECEIVED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-200 text-green-900',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-20">Loading dashboard...</div>;
  if (!data) return <div className="text-red-400 text-center py-20">Failed to load dashboard</div>;

  const { stats, recentOrders } = data;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm">Overview of ZimMarket Pro operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="bg-blue-500" />
        <StatCard icon={Clock} label="Pending Review" value={stats.pendingOrders} color="bg-orange-500" sub="Needs your attention" />
        <StatCard icon={Store} label="Active Sellers" value={stats.totalSellers} color="bg-green-500" />
        <StatCard icon={Users} label="Customers" value={stats.totalCustomers} color="bg-purple-500" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${Number(stats.totalRevenue || 0).toFixed(2)}`} color="bg-teal-500" />
        <StatCard icon={TrendingUp} label="Pending Payouts" value={`$${Number(stats.pendingPayouts || 0).toFixed(2)}`} color="bg-red-500" sub="Owed to sellers" />
      </div>

      {/* Pending orders alert */}
      {stats.pendingOrders > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-orange-800">⚠️ {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} need your review</p>
            <p className="text-sm text-orange-600">Review and confirm with sellers</p>
          </div>
          <Link to="/orders?status=RECEIVED" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
            View Orders
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link to="/orders" className="text-blue-600 text-sm hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase bg-gray-50">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <Link to={`/orders/${order.id}`} className="text-blue-600 font-mono font-semibold hover:underline">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{order.customer?.name}</p>
                    <p className="text-gray-400 text-xs">{order.customer?.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {order.items?.map(i => i.product?.name).join(', ').slice(0, 40)}
                    {order.items?.length > 1 && `... (+${order.items.length - 1})`}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">${order.totalAmount?.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
