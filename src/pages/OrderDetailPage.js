// src/pages/OrderDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['RECEIVED', 'UNDER_REVIEW', 'CONFIRMED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STATUS_COLORS = {
  RECEIVED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ status: '', note: '', riderName: '', riderPhone: '' });

  const loadOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
      setForm(f => ({ ...f, status: data.status }));
    } catch (e) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrder(); }, [id]);

  const updateStatus = async () => {
    if (!form.status) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, form);
      toast.success('Order updated!');
      loadOrder();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading order...</div>;
  if (!order) return <div className="text-center py-20 text-red-400">Order not found</div>;

  const addr = order.deliveryAddress || {};

  return (
    <div className="max-w-5xl">
      <button onClick={() => navigate('/orders')} className="text-blue-600 text-sm hover:underline mb-4">← Back to orders</button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
          <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status]}`}>
          {order.status?.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {item.product?.images?.[0] && (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">Seller: {item.seller?.businessName}</p>
                    <p className="text-xs text-gray-400">Seller phone: {item.seller?.user?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.subtotal?.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">{item.qty} × ${item.unitPrice?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
              <span className="text-gray-500">Delivery fee</span>
              <span className="font-medium">${order.deliveryFee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span>${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
            <div className="space-y-3">
              {order.statusLogs?.map(log => (
                <div key={log.id} className="flex gap-3 items-start">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{log.toStatus?.replace(/_/g, ' ')}</p>
                    {log.note && <p className="text-xs text-gray-500">{log.note}</p>}
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
            <p className="font-medium">{order.customer?.name}</p>
            <p className="text-sm text-gray-500">{order.customer?.phone}</p>
            {order.customer?.email && <p className="text-sm text-gray-500">{order.customer?.email}</p>}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium text-gray-700 mb-1">Delivery Address</p>
              <p className="text-gray-600">{addr.street || addr.address || JSON.stringify(addr)}</p>
              {addr.suburb && <p className="text-gray-600">{addr.suburb}</p>}
              {addr.city && <p className="text-gray-600">{addr.city}</p>}
              {addr.instructions && <p className="text-gray-400 text-xs mt-1 italic">{addr.instructions}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium uppercase">{order.paymentMethod}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${order.payment?.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment?.status}</span>
              </div>
              {order.paymentRef && <div className="flex justify-between"><span className="text-gray-500">Ref</span><span className="font-mono text-xs">{order.paymentRef}</span></div>}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Update Order</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase font-medium">New Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['RECEIVED', 'UNDER_REVIEW', 'CONFIRMED', 'OUT_OF_STOCK', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-medium">Note (optional)</label>
                <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                  rows={2} placeholder="Add a note..."
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {form.status === 'ASSIGNED' && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-medium">Rider Name</label>
                    <input value={form.riderName} onChange={e => setForm({ ...form, riderName: e.target.value })}
                      placeholder="Rider full name"
                      className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-medium">Rider Phone</label>
                    <input value={form.riderPhone} onChange={e => setForm({ ...form, riderPhone: e.target.value })}
                      placeholder="+263771234567"
                      className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              )}
              <button onClick={updateStatus} disabled={updating}
                className="w-full bg-blue-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors">
                {updating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>

          {/* Delivery */}
          {order.delivery && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Delivery</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Status:</span> <span className="font-medium">{order.delivery.status}</span></p>
                {order.delivery.riderName && <p><span className="text-gray-500">Rider:</span> <span className="font-medium">{order.delivery.riderName}</span></p>}
                {order.delivery.riderPhone && <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{order.delivery.riderPhone}</span></p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
