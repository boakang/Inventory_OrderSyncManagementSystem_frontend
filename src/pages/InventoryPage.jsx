import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Search,
  Filter,
  Plus,
  Trash2
} from 'lucide-react';
import { inventoryApi, productApi } from '../api';

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [selectedProductId, setSelectedProductId] = useState('');
  const [action, setAction] = useState('add');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getAll();
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products (for inventory):', error);
      setProducts([]);
    }
  };

  const productNameById = (productId) => {
    const p = products.find((x) => x.productID === productId);
    return p?.name ?? `Product #${productId}`;
  };

  const applyAdjustment = async () => {
    setSaveError('');

    const productID = Number(selectedProductId);
    const qty = Number(quantity);

    if (Number.isNaN(productID) || productID <= 0) {
      setSaveError('Please select a product.');
      return;
    }
    if (Number.isNaN(qty) || qty <= 0) {
      setSaveError('Quantity must be greater than 0.');
      return;
    }

    const transactionType = action === 'remove' ? 'Stock Out' : 'Stock In';

    if (action === 'remove')
    {
      const current = inventory.find((x) => x.productID === productID)?.quantity ?? 0;
      if (qty > current)
      {
        setSaveError(`Cannot remove ${qty}. Current stock is ${current}.`);
        return;
      }
    }

    try {
      setSaving(true);
      await inventoryApi.adjust({
        productID,
        quantity: qty,
        transactionType,
      });

      setSelectedProductId('');
      setQuantity('');
      await fetchInventory();
      await fetchProducts();
    } catch (error) {
      console.error('Error applying inventory adjustment:', error);
      setSaveError('Failed to apply adjustment.');
    } finally {
      setSaving(false);
    }
  };

  const deleteInventoryForProduct = async (productId) => {
    const ok = window.confirm(`Clear inventory history for product #${productId}?`);
    if (!ok) return;

    try {
      setLoading(true);
      await inventoryApi.delete(productId);
      await fetchInventory();
      await fetchProducts();
    } catch (error) {
      console.error('Error clearing inventory:', error);
      alert('Failed to clear inventory.');
    } finally {
      setLoading(false);
    }
  };

  const totalOnHand = inventory.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
  const skuCount = inventory.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
          <p className="text-slate-500">Track stock movements and warehouse activities.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-semibold">
            <ArrowDownLeft size={18} />
            <span>Stock In</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-semibold">
            <ArrowUpRight size={18} />
            <span>Stock Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card !p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <History size={18} className="text-slate-400" />
                Current Inventory Levels
              </h3>
              <div className="flex gap-2">
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400">
                  <Search size={16} />
                </button>
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400">
                  <Filter size={16} />
                </button>
              </div>
            </div>
            
            <table className="w-full text-left order-collapse">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/30">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading inventory...</td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">No inventory data.</td>
                  </tr>
                ) : inventory.map((row) => (
                  <tr key={row.productID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{productNameById(row.productID)}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{row.productID}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{row.quantity}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        type="button"
                        onClick={() => deleteInventoryForProduct(row.productID)}
                        title="Clear"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" />
              Quick Stock Adjustment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 whitespace-nowrap">Select Product</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.productID} value={p.productID}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Action</label>
                  <select
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                  >
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Quantity</label>
                  <input
                    type="number"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
              </div>
              {saveError && (
                <p className="text-sm font-semibold text-red-600">{saveError}</p>
              )}
              <button
                className="w-full btn-primary mt-2"
                type="button"
                onClick={applyAdjustment}
                disabled={saving}
              >
                {saving ? 'Applying...' : 'Apply Adjustment'}
              </button>
            </div>
          </div>

          <div className="card bg-slate-900 text-white border-0 shadow-xl shadow-slate-200">
            <h4 className="text-slate-400 text-sm font-medium mb-1">Inventory Summary</h4>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-3xl font-bold">{loading ? '...' : totalOnHand}</span>
              <span className="text-slate-400 text-xs mb-1.5">items on-hand</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>SKUs</span>
              <span>{loading ? '...' : skuCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AlertCircle = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default InventoryPage;
