import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter
} from 'lucide-react';
import { productApi } from '../api';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setLoadError('Failed to load products. Check backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeNewProduct = (field) => (e) => {
    setNewProduct((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submitNewProduct = async (e) => {
    e.preventDefault();
    setSaveError('');

    const payload = {
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      price: Number(newProduct.price),
      stockQuantity: Number(newProduct.stockQuantity),
    };

    if (!payload.name) {
      setSaveError('Name is required.');
      return;
    }

    if (Number.isNaN(payload.price) || Number.isNaN(payload.stockQuantity)) {
      setSaveError('Price and Stock must be valid numbers.');
      return;
    }

    if (payload.price < 0) {
      setSaveError('Price must be greater than or equal to 0.');
      return;
    }

    if (payload.stockQuantity < 0) {
      setSaveError('Stock Quantity must be greater than or equal to 0.');
      return;
    }

    try {
      setSaving(true);
      if (editingProductId != null) {
        await productApi.update(editingProductId, payload);
      } else {
        await productApi.add(payload);
      }
      setNewProduct({ name: '', description: '', price: '', stockQuantity: '' });
      setShowAddForm(false);
      setEditingProductId(null);
      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      setSaveError(editingProductId != null
        ? 'Failed to update product. Check backend is running.'
        : 'Failed to add product. Check backend is running.');
    } finally {
      setSaving(false);
    }
  };

  const startEditProduct = (product) => {
    setSaveError('');
    setEditingProductId(product.productID);
    setNewProduct({
      name: product.name ?? '',
      description: product.description ?? '',
      price: String(product.price ?? ''),
      stockQuantity: String(product.stockQuantity ?? ''),
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (product) => {
    const ok = window.confirm(`Delete product "${product.name}"?`);
    if (!ok) return;

    try {
      setLoading(true);
      await productApi.delete(product.productID);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    (p.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Products</h2>
          <p className="text-slate-500">Manage and track your product catalog.</p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => {
            setSaveError('');
            setEditingProductId(null);
            setNewProduct({ name: '', description: '', price: '', stockQuantity: '' });
            setShowAddForm((v) => !v);
          }}
          type="button"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {loadError && (
        <div className="card border border-red-200 bg-red-50 text-red-700 font-semibold">
          {loadError}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={submitNewProduct} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                value={newProduct.name}
                onChange={onChangeNewProduct('name')}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Price</label>
              <input
                value={newProduct.price}
                onChange={onChangeNewProduct('price')}
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <input
                value={newProduct.description}
                onChange={onChangeNewProduct('description')}
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Short description"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Stock Quantity</label>
              <input
                value={newProduct.stockQuantity}
                onChange={onChangeNewProduct('stockQuantity')}
                type="number"
                min="0"
                step="1"
                className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="0"
              />
            </div>
          </div>

          {saveError && (
            <p className="text-sm font-semibold text-red-600">{saveError}</p>
          )}

          <div className="flex items-center gap-2">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : (editingProductId != null ? 'Update' : 'Save')}
            </button>
            <button
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              type="button"
              onClick={() => {
                setSaveError('');
                setShowAddForm(false);
                setEditingProductId(null);
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card !p-4 flex items-center gap-4">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Items</p>
            <p className="text-lg font-bold text-slate-900">{products.length}</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-4">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Filter size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Low Stock</p>
            <p className="text-lg font-bold text-slate-900">
              {products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length}
            </p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Out of Stock</p>
            <p className="text-lg font-bold text-slate-900">
              {products.filter(p => p.stockQuantity === 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Product List */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading products...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No products found.</td>
              </tr>
            ) : filteredProducts.map((product) => (
              <tr key={product.productID} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-400">—</td>
                <td className="px-6 py-4 font-semibold text-slate-900">${product.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    product.stockQuantity === 0 
                      ? 'bg-red-100 text-red-700' 
                      : product.stockQuantity < 10 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-green-100 text-green-700'
                  }`}>
                    {product.stockQuantity === 0 ? 'Out of Stock' : `${product.stockQuantity} in stock`}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                      type="button"
                      onClick={() => startEditProduct(product)}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      type="button"
                      onClick={() => deleteProduct(product)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsPage;
