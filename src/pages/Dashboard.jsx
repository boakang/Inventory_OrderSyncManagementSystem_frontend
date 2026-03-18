import React, { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { productApi, customerApi, orderApi, devApi } from '../api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="card hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={12} />
            <span>{trend > 0 ? '+' : ''}{trend}% from last month</span>
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    revenue: '$0'
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [devResetting, setDevResetting] = useState(false);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const [productsRes, customersRes, ordersRes] = await Promise.all([
          productApi.getAll(),
          customerApi.getAll(),
          orderApi.getAll(),
        ]);

        const products = productsRes.data ?? [];
        const customers = customersRes.data ?? [];
        const orders = ordersRes.data ?? [];

        const revenueNumber = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const revenueFormatted = new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(revenueNumber);

        setStats({
          totalProducts: products.length,
          totalCustomers: customers.length,
          totalOrders: orders.length,
          revenue: revenueFormatted,
        });

        const sortedOrders = [...orders]
          .filter((o) => o?.orderDate)
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setRecentOrders(sortedOrders.slice(0, 4));

        const lows = products
          .filter((p) => typeof p.stockQuantity === 'number' && p.stockQuantity >= 0 && p.stockQuantity <= 5)
          .sort((a, b) => a.stockQuantity - b.stockQuantity)
          .slice(0, 3);
        setLowStockProducts(lows);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setStats({ totalProducts: 0, totalCustomers: 0, totalOrders: 0, revenue: '$0' });
        setRecentOrders([]);
        setLowStockProducts([]);
        setLoadError('Failed to load dashboard data. Check backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {isDev && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
            disabled={devResetting}
            onClick={async () => {
              const ok = window.confirm('Dev action: Reset DB (clears customers/products/orders/inventory; keeps categories & suppliers). Continue?');
              if (!ok) return;

              try {
                setDevResetting(true);
                await devApi.resetDb(true);
                await devApi.seed();
                window.location.reload();
              } catch (error) {
                console.error('Dev reset+reseed failed:', error);
                alert('Reset failed. Check backend is running in Development.');
              } finally {
                setDevResetting(false);
              }
            }}
          >
            {devResetting ? 'Dev: Resetting...' : 'Dev: Reset DB'}
          </button>
        </div>
      )}

      {loadError && (
        <div className="card border border-red-200 bg-red-50 text-red-700 font-semibold">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={loading ? '...' : stats.totalProducts} 
          icon={Package} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Customers" 
          value={loading ? '...' : stats.totalCustomers} 
          icon={Users} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Total Orders" 
          value={loading ? '...' : stats.totalOrders} 
          icon={ShoppingCart} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Total Revenue" 
          value={loading ? '...' : stats.revenue} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-slate-400">Loading...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-sm text-slate-400">No recent activity.</div>
            ) : recentOrders.map((o) => (
              <div key={o.orderID} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Order #ORD-{String(o.orderID).padStart(4, '0')}</p>
                  <p className="text-xs text-slate-500">{new Date(o.orderDate).toLocaleString()}</p>
                </div>
                <div className="ml-auto text-sm font-semibold text-slate-900">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(o.totalAmount) || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Low Stock Alerts</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-slate-400">Loading...</div>
            ) : lowStockProducts.length === 0 ? (
              <div className="text-sm text-slate-400">No low stock alerts.</div>
            ) : lowStockProducts.map((p) => (
              <div key={p.productID} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">Product ID: {p.productID}</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    {p.stockQuantity} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
