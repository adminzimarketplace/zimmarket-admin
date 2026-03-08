// src/pages/SellersPage.js
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== '') params.approved = filter;
      const { data } = await api.get('/admin/sellers', { params });
      setSellers(data.sellers);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateSeller = async (id, isApproved) => {
    try {
      await api.patch(`/admin/sellers/${id}`, { isApproved });
      toast.success(`Seller ${isApproved ? 'approved' : 'rejected'}`);
      load();
    } catch (e) { toast.error('Failed to update seller'); }
  };

  const updateCommission = async (id, rate) => {
    const newRate = prompt('Enter commission rate % (e.g. 10):');
    if (!newRate) return;
    try {
      await api.patch(`/admin/sellers/${id}`, { commissionRate: parseFloat(newRate) });
      toast.success('Commission rate updated');
      load();
    } catch (e) { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sellers</h2>
          <p className="text-gray-500 text-sm">Manage vendor accounts</p>
        </div>
        <div className="flex gap-2">
          {[['', 'All'], ['false', 'Pending'], ['true', 'Approved']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === val ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs uppercase bg-gray-50">
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Commission</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading...</td></tr>
            ) : sellers.map(seller => (
              <tr key={seller.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{seller.businessName}</p>
                  <p className="text-xs text-gray-400">{seller.user?.name}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-gray-700">{seller.user?.phone}</p>
                  <p className="text-xs text-gray-400">{seller.user?.email || '—'}</p>
                </td>
                <td className="px-5 py-4 text-gray-600">{seller.location}</td>
                <td className="px-5 py-4">
                  <button onClick={() => updateCommission(seller.id)}
                    className="text-blue-600 hover:underline">{seller.commissionRate}%</button>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${seller.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {seller.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">{new Date(seller.user?.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {!seller.isApproved && (
                      <button onClick={() => updateSeller(seller.id, true)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">Approve</button>
                    )}
                    {seller.isApproved && (
                      <button onClick={() => updateSeller(seller.id, false)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">Revoke</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
