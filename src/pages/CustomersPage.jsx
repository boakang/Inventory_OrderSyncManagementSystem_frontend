import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical,
  ChevronRight,
  Edit2,
  Trash2
} from 'lucide-react';
import { customerApi } from '../api';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setLoadError('Failed to load customers. Check backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeNewCustomer = (field) => (e) => {
    setNewCustomer((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submitNewCustomer = async (e) => {
    e.preventDefault();
    setSaveError('');

    const payload = {
      firstName: newCustomer.firstName.trim(),
      lastName: newCustomer.lastName.trim(),
      email: newCustomer.email.trim(),
      phone: newCustomer.phone.trim(),
      address: newCustomer.address.trim(),
    };

    if (!payload.firstName || !payload.lastName) {
      setSaveError('First name and last name are required.');
      return;
    }

    if (!payload.email) {
      setSaveError('Email is required.');
      return;
    }

    try {
      setSaving(true);
      if (editingCustomerId != null) {
        await customerApi.update(editingCustomerId, payload);
      } else {
        await customerApi.add(payload);
      }
      setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', address: '' });
      setShowAddForm(false);
      setEditingCustomerId(null);
      await fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      setSaveError(editingCustomerId != null
        ? 'Failed to update customer. Check backend is running.'
        : 'Failed to add customer. Check backend is running.');
    } finally {
      setSaving(false);
    }
  };

  const startEditCustomer = (customer) => {
    setSaveError('');
    setEditingCustomerId(customer.customerID);
    setNewCustomer({
      firstName: customer.firstName ?? '',
      lastName: customer.lastName ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCustomer = async (customer) => {
    const ok = window.confirm(`Delete customer "${customer.firstName} ${customer.lastName}"?`);
    if (!ok) return;

    try {
      setLoading(true);
      await customerApi.delete(customer.customerID);
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maskEmail = (email) => {
    const value = String(email ?? '').trim();
    if (!value) return '';

    const atIndex = value.indexOf('@');
    const local = atIndex === -1 ? value : value.slice(0, atIndex);

    if (local.length <= 2) return `${local[0] ?? ''}***`;
    if (local.length <= 6) return `${local.slice(0, 2)}***`;

    return `${local.slice(0, 3)}***${local.slice(-2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Customer Management</h2>
          <p className="text-slate-500">View and manage your client database.</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => {
            setSaveError('');
            setEditingCustomerId(null);
            setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', address: '' });
            setShowAddForm((v) => !v);
          }}
          type="button"
        >
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      {loadError && (
        <div className="card border border-red-200 bg-red-50 text-red-700 font-semibold">
          {loadError}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={submitNewCustomer} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">First Name</label>
              <input
                value={newCustomer.firstName}
                onChange={onChangeNewCustomer('firstName')}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Last Name</label>
              <input
                value={newCustomer.lastName}
                onChange={onChangeNewCustomer('lastName')}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Last name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                value={newCustomer.email}
                onChange={onChangeNewCustomer('email')}
                type="email"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input
                value={newCustomer.phone}
                onChange={onChangeNewCustomer('phone')}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Phone"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Address</label>
              <input
                value={newCustomer.address}
                onChange={onChangeNewCustomer('address')}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Address"
              />
            </div>
          </div>

          {saveError && (
            <p className="text-sm font-semibold text-red-600">{saveError}</p>
          )}

          <div className="flex items-center gap-2">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : (editingCustomerId != null ? 'Update' : 'Save')}
            </button>
            <button
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              type="button"
              onClick={() => {
                setSaveError('');
                setShowAddForm(false);
                setEditingCustomerId(null);
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

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
              <div className="flex items-center gap-1">
                <button
                  className="p-1 text-slate-400 hover:text-primary-600"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditCustomer(customer);
                  }}
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="p-1 text-slate-400 hover:text-red-600"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustomer(customer);
                  }}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
                <button className="p-1 text-slate-400 hover:text-slate-600" type="button" title="More">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {customer.firstName} {customer.lastName}
            </h3>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail size={14} />
                <span>{maskEmail(customer.email)}</span>
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
