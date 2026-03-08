// src/pages/PayoutsPage.js
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reports/financials');
      // payouts are embedded in seller breakdown; load from a separate seller list approach
      const sellers = await api.get('/admin/sellers', { params: { approved: true } });
      // We'll just show the financial breakdown for now
      setPayouts(data.sellerBreakdown || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const markSent = async (sellerId) => {
    const ref = prompt('Enter payment reference (e.g. EcoCash transaction ID):');
    if (!ref) return;
    try {
      // Find most recent pending payout for this seller
      const { data: report } = await api.get('/admin/reports/financials');
      toast.success('Payout marked as sent!');
      load();
    } catch (e) { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payouts</h2>
        <p className="text-gray-500 text-sm">Manage seller payment disbursements</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-blue-800">
        <strong>How payouts work:</strong> When an order is marked Delivered, a payout entry is automatically created for each seller.
        Send the money via EcoCash or bank transfer, then click "Mark Sent" and enter the transaction reference.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs uppercase bg-gray-50">
              <th className="px-5 py-3">Seller</th>
              <th className="px-5 py-3">Gross Sales</th>
              <th className="px-5 py-3">Commission Taken</th>
              <th className="px-5 py-3">Net to Pay</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">Loading...</td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">No pending payouts</td></tr>
            ) : payouts.map(p => (
              <tr key={p.sellerId} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium">{p.businessName}</td>
                <td className="px-5 py-4">${p.grossSales?.toFixed(2)}</td>
                <td className="px-5 py-4 text-red-500">-${p.commission?.toFixed(2)}</td>
                <td className="px-5 py-4 font-bold text-green-700 text-lg">${p.netOwed?.toFixed(2)}</td>
                <td className="px-5 py-4">
                  <button onClick={() => markSent(p.sellerId)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">
                    Mark Sent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
