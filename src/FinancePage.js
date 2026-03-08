// src/pages/FinancePage.js
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function FinancePage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reports/financials', { params: { from, to } });
      setReport(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
        <p className="text-gray-500 text-sm">Revenue, commissions and seller payouts</p>
      </div>

      <div className="flex gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From Date</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To Date</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex items-end">
          <button onClick={load} className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800">
            Apply Filter
          </button>
        </div>
      </div>

      {loading ? <p className="text-center text-gray-400 py-10">Loading report...</p> : report && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Sales', value: `$${report.totalSales.toFixed(2)}`, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Platform Commission', value: `$${report.totalCommission.toFixed(2)}`, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Pending Payouts', value: `$${report.pendingPayouts.toFixed(2)}`, color: 'text-orange-700', bg: 'bg-orange-50' },
              { label: 'Sent Payouts', value: `$${report.sentPayouts.toFixed(2)}`, color: 'text-purple-700', bg: 'bg-purple-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-5`}>
                <p className="text-sm text-gray-600 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Per-Seller Breakdown</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs uppercase bg-gray-50">
                  <th className="px-5 py-3">Business</th>
                  <th className="px-5 py-3">Gross Sales</th>
                  <th className="px-5 py-3">Commission</th>
                  <th className="px-5 py-3">Net Owed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.sellerBreakdown.map(s => (
                  <tr key={s.sellerId} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium">{s.businessName}</td>
                    <td className="px-5 py-4">${s.grossSales?.toFixed(2)}</td>
                    <td className="px-5 py-4 text-red-600">-${s.commission?.toFixed(2)}</td>
                    <td className="px-5 py-4 font-semibold text-green-700">${s.netOwed?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
