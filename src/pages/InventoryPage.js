import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { inventoryApi } from '../api';

function InventoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Mocking inventory transactions for now
      setTransactions([
        { id: 1, product: 'MacBook Pro 14"', type: 'Inbound', quantity: 20, date: '2023-11-21T09:00:00', user: 'Admin' },
        { id: 2, product: 'iPhone 15 Pro', type: 'Outbound', quantity: 5, date: '2023-11-21T11:30:00', user: 'Sales-Mobile' },
        { id: 3, product: 'iPad Air', type: 'Inbound', quantity: 10, date: '2023-11-21T14:45:00', user: 'Admin' },
        { id: 4, product: 'AirPods Pro 2', type: 'Outbound', quantity: 12, date: '2023-11-21T16:20:00', user: 'Sales-Web' },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
                Transaction History
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
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{t.product}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                        t.type === 'Inbound' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {t.type === 'Inbound' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {t.type === 'Inbound' ? '+' : '-'}{t.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(t.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{t.user}</td>
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
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
                  <option>Search and select product...</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Action</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                    <option>Add Stock</option>
                    <option>Remove Stock</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Quantity</label>
                  <input type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="0" />
                </div>
              </div>
              <button className="w-full btn-primary mt-2">
                Apply Adjustment
              </button>
            </div>
          </div>

          <div className="card bg-slate-900 text-white border-0 shadow-xl shadow-slate-200">
            <h4 className="text-slate-400 text-sm font-medium mb-1">Warehouse Capacity</h4>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-bold">78%</span>
              <span className="text-slate-400 text-xs mb-1.5">Full</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-primary-500" style={{ width: '78%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Main Warehouse</span>
              <span>15,420 / 20,000 items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add AlertCircle icon import
const AlertCircle = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default InventoryPage;