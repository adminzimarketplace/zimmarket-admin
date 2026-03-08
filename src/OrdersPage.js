// src/pages/OrdersPage.js
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const STATUSES = ['ALL', 'RECEIVED', 'UNDER_REVIEW', 'CONFIRMED', 'OUT_OF_STOCK', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS = {
  RECEIVED: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  ASSIGNED: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const status = searchParams.get('status') || '';

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (status && status !== 'ALL') params.status = status;
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [status, page]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-gray-500 text-sm">{total} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => { setSearchParams(s === 'ALL' ? {} : { status: s }); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              (status === s || (s === 'ALL' && !status))
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase bg-gray-50">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Sellers</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <span className="font-mono font-semibold text-blue-700">#{order.id.slice(0,8).toUpperCase()}</span>
                    <p className="text-xs text-gray-400">{order.items?.length} item(s)</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{order.customer?.name}</p>
                    <p className="text-xs text-gray-400">{order.customer?.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {[...new Set(order.items?.map(i => i.seller?.businessName))].join(', ')}
                  </td>
                  <td className="px-5 py-4 font-semibold">${order.totalAmount?.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.payment?.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment?.status || 'PENDING'}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{order.paymentMethod}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <Link to={`/orders/${order.id}`} className="text-blue-600 hover:underline text-xs font-medium">Manage →</Link>
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
