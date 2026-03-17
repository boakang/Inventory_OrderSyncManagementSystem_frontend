import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Filter,
  ArrowRight
} from 'lucide-react';
import { productApi } from '../api';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback local data for demo if API fails
      setProducts([
        { productID: 1, name: 'MacBook Pro 14"', description: 'M3 Pro, 16GB RAM, 512GB SSD', price: 1999, stockQuantity: 15 },
        { productID: 2, name: 'iPhone 15 Pro', description: 'Natural Titanium, 128GB', price: 999, stockQuantity: 42 },
        { productID: 3, name: 'iPad Air', description: 'M1 Chip, 64GB, Space Gray', price: 599, stockQuantity: 0 },
        { productID: 4, name: 'AirPods Pro 2', description: 'USB-C Charging Case', price: 249, stockQuantity: 85 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Products</h2>
          <p className="text-slate-500">Manage and track your product catalog.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

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
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>Filter</span>
          </button>
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
                <td className="px-6 py-4 font-medium text-slate-600">Electronics</td>
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
                    <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
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