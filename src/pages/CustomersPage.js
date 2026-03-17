import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { customerApi } from '../api';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Fallback local data
      setCustomers([
        { customerID: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123-456-7890', address: '123 Main St' },
        { customerID: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '098-765-4321', address: '456 Oak Ave' },
        { customerID: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', phone: '555-0123', address: '789 Pine Rd' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Customer Management</h2>
          <p className="text-slate-500">View and manage your client database.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-12 text-slate-400">Loading customers...</p>
        ) : filteredCustomers.map((customer) => (
          <div key={customer.customerID} className="card group hover:border-primary-200 hover:ring-1 hover:ring-primary-100 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
                {customer.firstName[0]}{customer.lastName[0]}
              </div>
              <button className="p-1 text-slate-400 hover:text-slate-600">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {customer.firstName} {customer.lastName}
            </h3>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail size={14} />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone size={14} />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={14} />
                <span className="line-clamp-1">{customer.address}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Active Client</span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-400 transform group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomersPage;