import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  add: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const customerApi = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  add: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const orderApi = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getByProductId: (productId) => api.get(`/inventory/${productId}`),
  adjust: (data) => api.post('/inventory', data),
  update: (productId, data) => api.put(`/inventory/${productId}`, data),
  delete: (productId) => api.delete(`/inventory/${productId}`),
};

export const reportApi = {
  getTopSelling: (topN = 5) => api.get(`/reports/top-selling?topN=${topN}`),
  getInventory: () => api.get('/reports/inventory'),
  getRevenue: (period = 'daily') => api.get(`/reports/revenue?period=${period}`),
};

export default api;
