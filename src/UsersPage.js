// src/pages/UsersPage.js
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { search, role, limit: 50 } });
      setUsers(data.users);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [role]);

  const toggleUser = async (id, isActive) => {
    try {
      await api.patch(`/admin/users/${id}`, { isActive: !isActive });
      toast.success(`User ${isActive ? 'blocked' : 'activated'}`);
      load();
    } catch (e) { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="text-gray-500 text-sm">Manage all platform users</p>
      </div>

      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
          placeholder="Search by name, phone..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs" />
        <button onClick={load} className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm">Search</button>
        {['', 'CUSTOMER', 'SELLER', 'ADMIN'].map(r => (
          <button key={r} onClick={() => setRole(r)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${role === r ? 'bg-blue-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {r || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs uppercase bg-gray-50">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">OTP Verified</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">Loading...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium">{user.name}</td>
                <td className="px-5 py-4 text-gray-600">{user.phone}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'SELLER' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{user.role}</span>
                </td>
                <td className="px-5 py-4">{user.otpVerified ? '✓' : '✗'}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.isActive ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  {user.role !== 'ADMIN' && (
                    <button onClick={() => toggleUser(user.id, user.isActive)}
                      className={`px-3 py-1 rounded text-xs font-medium ${user.isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                      {user.isActive ? 'Block' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
