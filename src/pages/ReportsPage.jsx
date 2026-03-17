import React, { useEffect, useState } from 'react';
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
  Cell
} from 'recharts';
import { Download, Calendar, TrendingUp } from 'lucide-react';

import { reportApi } from '../api';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

function ReportsPage() {
  const [revenueData, setRevenueData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const [revenueRes, topRes] = await Promise.all([
          reportApi.getRevenue('monthly'),
          reportApi.getTopSelling(5),
        ]);

        setRevenueData(revenueRes.data ?? []);
        setProductData(topRes.data ?? []);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setRevenueData([]);
        setProductData([]);
        setLoadError('Failed to load reports. Check backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

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

      {loadError && (
        <div className="card border border-red-200 bg-red-50 text-red-700 font-semibold">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue Trends</h3>
            {!loading && revenueData.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <TrendingUp size={12} />
                <span>Live</span>
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex-1 w-full flex items-center justify-center text-slate-400">Loading...</div>
          ) : revenueData.length === 0 ? (
            <div className="flex-1 w-full flex items-center justify-center text-slate-400">No revenue data.</div>
          ) : (
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
          )}
        </div>

        <div className="card h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6">Top Selling Products</h3>
          {loading ? (
            <div className="flex-1 w-full flex items-center justify-center text-slate-400">Loading...</div>
          ) : productData.length === 0 ? (
            <div className="flex-1 w-full flex items-center justify-center text-slate-400">No top selling data.</div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
