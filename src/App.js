import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

const Login = React.lazy(() => import('./pages/LoginPage'));
const Dashboard = React.lazy(() => import('./pages/DashboardPage'));
const Orders = React.lazy(() => import('./pages/OrdersPage'));
const OrderDetail = React.lazy(() => import('./pages/OrderDetailPage'));
const Products = React.lazy(() => import('./pages/ProductsPage'));
const Sellers = React.lazy(() => import('./pages/SellersPage'));
const Users = React.lazy(() => import('./pages/UsersPage'));
const Finance = React.lazy(() => import('./pages/FinancePage'));
const Payouts = React.lazy(() => import('./pages/PayoutsPage'));
const Layout = React.lazy(() => import('./components/layout/Layout'));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="users" element={<Users />} />
          <Route path="finance" element={<Finance />} />
          <Route path="payouts" element={<Payouts />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
