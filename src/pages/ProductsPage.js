// src/pages/ProductsPage.js
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending'); // pending | all

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'pending') {
        const { data } = await api.get('/admin/products/pending');
        setProducts(data);
      } else {
        const { data } = await api.get('/products', { params: { limit: 50 } });
        setProducts(data.products);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const review = async (id, isApproved, rejectionReason) => {
    try {
      await api.patch(`/admin/products/${id}/review`, { isApproved, rejectionReason });
      toast.success(isApproved ? 'Product approved!' : 'Product rejected');
      load();
    } catch (e) { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500 text-sm">Review and manage product listings</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'all'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-blue-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {t === 'pending' ? 'Pending Approval' : 'All Products'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? <p className="text-gray-400 col-span-3 py-10 text-center">Loading...</p>
          : products.length === 0 ? <p className="text-gray-400 col-span-3 py-10 text-center">No products</p>
          : products.map(product => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {product.images?.[0] && (
                <img src={product.images[0]} alt={product.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <span className="text-green-600 font-bold ml-2">${product.price?.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{product.seller?.businessName}</p>
                <p className="text-xs text-gray-400 mb-3">{product.description?.slice(0, 80)}...</p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>Stock: {product.stockQty}</span>
                  <span className={`px-2 py-0.5 rounded-full ${product.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {product.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                {!product.isApproved && (
                  <div className="flex gap-2">
                    <button onClick={() => review(product.id, true)}
                      className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-600">
                      ✓ Approve
                    </button>
                    <button onClick={() => { const r = prompt('Rejection reason:'); if (r) review(product.id, false, r); }}
                      className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
