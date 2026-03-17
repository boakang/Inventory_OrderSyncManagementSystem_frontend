import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Download, Filter, Calendar, TrendingUp } from 'lucide-react';

const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

const productData = [
  { name: 'MacBook Pro', sales: 45 },
  { name: 'iPhone 15', sales: 72 },
  { name: 'iPad Air', sales: 28 },
  { name: 'AirPods Pro', sales: 94 },
  { name: 'Apple Watch', sales: 51 },
];

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics & Reports</h2>
          <p className="text-slate-500">Business performance and data insights.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm">
            <Calendar size={18} />
            <span>Last 30 Days</span>
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue Trends</h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <TrendingUp size={12} />
              <span>+18%</span>
            </div>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0ea5e9', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6">Top Selling Products</h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-bold text-slate-900 mb-6">Performance Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Inventory Value</p>
              <p className="text-2xl font-bold text-slate-900">$1,240,500</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">↑ 2.4% from last week</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Average Order Value</p>
              <p className="text-2xl font-bold text-slate-900">$342.10</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">↑ 12% from last month</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Fulfillment Rate</p>
              <p className="text-2xl font-bold text-slate-900">98.2%</p>
              <p className="text-xs text-slate-400 font-medium mt-1">On target</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Customer Growth</p>
              <p className="text-2xl font-bold text-slate-900">+124</p>
              <p className="text-xs text-primary-600 font-medium mt-1">New this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;