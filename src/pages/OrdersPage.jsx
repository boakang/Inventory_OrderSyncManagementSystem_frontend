import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Package,
  ArrowRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { orderApi, productApi } from '../api';

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
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [products, setProducts] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customerID: '',
    productID: '',
    quantity: '1',
    unitPrice: '',
  });

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('Pending');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await orderApi.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setLoadError('Failed to load orders. Check backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try
    {
      const response = await productApi.getAll();
      setProducts(response.data);
    }
    catch (error)
    {
      console.error('Error fetching products (for order create):', error);
      setProducts([]);
    }
  };

  const onChangeNewOrder = (field) => (e) => {
    const value = e.target.value;
    setNewOrder((prev) => ({ ...prev, [field]: value }));

    if (field === 'productID')
    {
      const productIdNum = Number(value);
      const product = products.find((p) => p.productID === productIdNum);
      if (product && (newOrder.unitPrice === '' || Number(newOrder.unitPrice) === 0))
      {
        setNewOrder((prev) => ({ ...prev, unitPrice: String(product.price ?? '') }));
      }
    }
  };

  const submitNewOrder = async (e) => {
    e.preventDefault();
    setCreateError('');

    const customerID = Number(newOrder.customerID);
    const productID = Number(newOrder.productID);
    const quantity = Number(newOrder.quantity);
    const unitPrice = Number(newOrder.unitPrice);

    if (Number.isNaN(customerID) || customerID <= 0) {
      setCreateError('CustomerID must be a valid number.');
      return;
    }
    if (Number.isNaN(productID) || productID <= 0) {
      setCreateError('Product must be selected.');
      return;
    }
    if (Number.isNaN(quantity) || quantity <= 0) {
      setCreateError('Quantity must be greater than 0.');
      return;
    }
    if (Number.isNaN(unitPrice) || unitPrice <= 0) {
      setCreateError('Unit price must be greater than 0.');
      return;
    }

    const payload = {
      customerID,
      totalAmount: quantity * unitPrice,
      status: 'Pending',
      orderDetails: [
        {
          productID,
          quantity,
          unitPrice,
        },
      ],
    };

    try {
      setCreating(true);
      await orderApi.create(payload);
      setNewOrder({ customerID: '', productID: '', quantity: '1', unitPrice: '' });
      setShowCreateForm(false);
      await fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      setCreateError('Failed to create order. Check stock and backend logs.');
    } finally {
      setCreating(false);
    }
  };

  const startEditOrder = (order) => {
    setSaveError('');
    setEditingOrderId(order.orderID);
    setEditingStatus(order.status ?? 'Pending');
    setShowEditForm(true);
    setShowCreateForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitEditOrder = async (e) => {
    e.preventDefault();
    setSaveError('');

    try {
      setSaving(true);
      await orderApi.update(editingOrderId, { status: editingStatus });
      setShowEditForm(false);
      setEditingOrderId(null);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      setSaveError('Failed to update order status.');
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async (order) => {
    const ok = window.confirm(`Delete order #ORD-${String(order.orderID).padStart(4, '0')}?`);
    if (!ok) return;

    try {
      setLoading(true);
      await orderApi.delete(order.orderID);
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return true;
    const orderIdText = `ord-${String(o.orderID ?? '').padStart(4, '0')}`;
    return (
      orderIdText.includes(needle) ||
      String(o.customerID ?? '').toLowerCase().includes(needle) ||
      String(o.status ?? '').toLowerCase().includes(needle)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales Orders</h2>
          <p className="text-slate-500">Track and fulfill customer orders.</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          type="button"
          onClick={() => {
            setCreateError('');
            setShowEditForm(false);
            setEditingOrderId(null);
            setShowCreateForm((v) => !v);
          }}
        >
          <Plus size={20} />
          <span>Create New Order</span>
        </button>
      </div>

      {loadError && (
        <div className="card border border-red-200 bg-red-50 text-red-700 font-semibold">
          {loadError}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={submitNewOrder} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Customer ID</label>
              <input
                value={newOrder.customerID}
                onChange={onChangeNewOrder('customerID')}
                type="number"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Product</label>
              <select
                value={newOrder.productID}
                onChange={onChangeNewOrder('productID')}
                className="mt-1 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.productID} value={p.productID}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Quantity</label>
              <input
                value={newOrder.quantity}
                onChange={onChangeNewOrder('quantity')}
                type="number"
                min="1"
                step="1"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Unit Price</label>
              <input
                value={newOrder.unitPrice}
                onChange={onChangeNewOrder('unitPrice')}
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="0"
              />
            </div>
          </div>

          {createError && (
            <p className="text-sm font-semibold text-red-600">{createError}</p>
          )}

          <div className="flex items-center gap-2">
            <button className="btn-primary" type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              type="button"
              onClick={() => setShowCreateForm(false)}
              disabled={creating}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showEditForm && (
        <form onSubmit={submitEditOrder} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Order ID</label>
              <input
                value={editingOrderId ?? ''}
                disabled
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {saveError && (
            <p className="text-sm font-semibold text-red-600">{saveError}</p>
          )}

          <div className="flex items-center gap-2">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update'}
            </button>
            <button
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              type="button"
              onClick={() => {
                setShowEditForm(false);
                setEditingOrderId(null);
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card !p-0">
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Showing {filteredOrders.length} orders</span>
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading orders...</td></tr>
              ) : filteredOrders.map((order) => (
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                        type="button"
                        onClick={() => startEditOrder(order)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        type="button"
                        onClick={() => deleteOrder(order)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm inline-flex items-center gap-1" type="button">
                        View <ArrowRight size={14} />
                      </button>
                    </div>
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
