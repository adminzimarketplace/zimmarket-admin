import React, { useEffect, useState } from 'react';
import { UserCheck, UserX, Link as LinkIcon, Copy, CheckCircle, Clock, XCircle, Store, Phone, Mail, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SELLER_SIGNUP_URL = process.env.REACT_APP_SELLER_URL
  ? process.env.REACT_APP_SELLER_URL + '/register'
  : window.location.origin.replace('admin', 'seller') + '/register';

export default function SellersPage() {
  const [sellers, setSellers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all'); // all | pending | approved
  const [expanded, setExpanded]     = useState(null);
  const [processing, setProcessing] = useState(null);

  const load = () => {
    setLoading(true);
    const q = filter === 'all' ? '' : `?approved=${filter === 'approved'}`;
    api.get('/admin/sellers' + q)
      .then(r => setSellers(r.data.sellers))
      .catch(() => toast.error('Failed to load sellers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const copyLink = () => {
    navigator.clipboard?.writeText(SELLER_SIGNUP_URL).then(() => {
      toast.success('Link copied!');
    }).catch(() => {
      toast('Link: ' + SELLER_SIGNUP_URL, { duration: 5000 });
    });
  };

  const handleApprove = async (sellerId, approve) => {
    setProcessing(sellerId);
    try {
      await api.patch('/admin/sellers/' + sellerId, { isApproved: approve });
      toast.success(approve ? 'Seller approved! SMS sent.' : 'Seller suspended.');
      load();
    } catch {
      toast.error('Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const pending  = sellers.filter(s => !s.isApproved);
  const approved = sellers.filter(s => s.isApproved);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sellers</h1>
        <p className="text-gray-500 text-sm mt-1">Manage seller accounts and verifications</p>
      </div>

      {/* Invite link card */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-xl"><LinkIcon size={20}/></div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">Seller Sign-Up Link</h3>
            <p className="text-green-100 text-sm mt-1 mb-3">
              Share this link with vendors. They fill in their details and you review & approve them.
            </p>
            <div className="bg-white bg-opacity-20 rounded-xl px-3 py-2 text-sm font-mono truncate mb-3">
              {SELLER_SIGNUP_URL}
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-50 transition"
            >
              <Copy size={15}/> Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: sellers.length,    color: 'text-gray-800'  },
          { label: 'Pending',  value: pending.length,    color: 'text-yellow-600' },
          { label: 'Approved', value: approved.length,   color: 'text-green-700'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all','pending','approved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${filter === f ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border hover:border-green-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sellers list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-24 animate-pulse shadow"/>)}
        </div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🏪</div>
          <p className="text-gray-500">No sellers yet. Share the sign-up link above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sellers.map(seller => (
            <div key={seller.id} className="bg-white rounded-xl shadow overflow-hidden">
              {/* Seller summary row */}
              <div
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpanded(expanded === seller.id ? null : seller.id)}
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="text-green-700" size={22}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{seller.businessName}</h3>
                    {seller.isApproved ? (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle size={11}/> Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                        <Clock size={11}/> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{seller.user?.name} · {seller.contactPhone}</p>
                </div>
                {expanded === seller.id ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0"/> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0"/>}
              </div>

              {/* Expanded details */}
              {expanded === seller.id && (
                <div className="border-t px-4 py-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} className="text-gray-400"/>{seller.user?.phone}
                    </div>
                    {seller.user?.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} className="text-gray-400"/>{seller.user.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={14} className="text-gray-400"/>{seller.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Store size={14} className="text-gray-400"/>Commission: {seller.commissionRate}%
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Registered: {new Date(seller.createdAt).toLocaleDateString('en-ZW', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-3 flex-wrap">
                    {!seller.isApproved ? (
                      <button
                        onClick={() => handleApprove(seller.id, true)}
                        disabled={processing === seller.id}
                        className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-600 disabled:opacity-50 transition"
                      >
                        <UserCheck size={16}/>
                        {processing === seller.id ? 'Processing...' : 'Approve Seller'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(seller.id, false)}
                        disabled={processing === seller.id}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-100 disabled:opacity-50 transition border border-red-200"
                      >
                        <UserX size={16}/>
                        {processing === seller.id ? 'Processing...' : 'Suspend Seller'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
