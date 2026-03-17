import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XOutline,
  AlertCircle,
  Package,
  ArrowRight
} from 'lucide-react';
import { orderApi } from '../api';

const StatusBadge = ({ status }) => {
  const configs = {
    'Pending': { color: 'bg-orange-100 text-orange-700', icon: Clock },
    'Confirmed': { color: 'bg-blue-100 text-blue-700', icon: Package },
    'Completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    'Cancelled': { color: 'bg-red-100 text-red-700', icon: AlertCircle },
  };
  const config = configs[status] || configs['Pending'];
  const Icon = config.icon;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback
      setOrders([
        { orderID: 1, customerID: 1, orderDate: '2023-11-20T10:30:00', totalAmount: 1450.50, status: 'Completed' },
        { orderID: 2, customerID: 2, orderDate: '2023-11-21T14:15:00', totalAmount: 890.00, status: 'Pending' },
        { orderID: 3, customerID: 1, orderDate: '2023-11-21T16:45:00', totalAmount: 240.00, status: 'Confirmed' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales Orders</h2>
          <p className="text-slate-500">Track and fulfill customer orders.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Create New Order</span>
        </button>
      </div>

      <div className="card !p-0">
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search orders..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Showing {orders.length} orders</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left order-collapse">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading orders...</td></tr>
              ) : orders.map((order) => (
                <tr key={order.orderID} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">#ORD-{order.orderID.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">Client #{order.customerID}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">${order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm inline-flex items-center gap-1">
                      View <ArrowRight size={14} />
                    </button>
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

export default OrdersPage;