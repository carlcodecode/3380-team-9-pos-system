// src/services/api.js

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper: build request with auth token
const getHeaders = (isJSON = true) => {
  const token = localStorage.getItem('token');
  const headers = {};

  if (isJSON) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
};

// ==============================
// AUTH
// ==============================
export const login = async (credentials) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};

export const register = async (data) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
};

export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ==============================
// STAFF MANAGEMENT
// ==============================
export const getAllStaff = async () => {
  const res = await fetch(`${API_BASE_URL}/admin/staff`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load staff');
  return res.json();
};

export const getStaffById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get staff');
  return res.json();
};

export const createStaff = async (data) => {
  const res = await fetch(`${API_BASE_URL}/admin/staff`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create staff');
  return res.json();
};

export const updateStaff = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update staff');
  return res.json();
};

export const deleteStaff = async (id) => {
  const res = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete staff');
  return res.json();
};

// ==============================
// STOCK MANAGEMENT
// ==============================
export const getAllStocks = async () => {
  const res = await fetch(`${API_BASE_URL}/stocks`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load stocks');
  return res.json();
};

export const getStockById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/stocks/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get stock item');
  return res.json();
};

export const updateStock = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/stocks/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update stock item');
  return res.json();  
};

export const updateStockSettings = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/stocks/${id}/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update stock settings');
  return res.json();  
};

export const restockMeal = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/stocks/${id}/restock`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to restock meal');
  return res.json();  
};

export const getLowStockAlerts = async () => {
  const res = await fetch(`${API_BASE_URL}/stocks/alerts`, {
    headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
  });
  if (!res.ok) throw new Error('Failed to load low stock alerts');
  return await res.json();
} 

export const resolveLowStockAlert = async (alertId) => {
  const res = await fetch(`${API_BASE_URL}/stocks/alerts/${alertId}/resolve`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!res.ok) throw new Error('Failed to resolve alert');
  return res.json();
};

// ==============================
// MEAL MANAGEMENT
// ==============================
export const getAllMeals = async () => {
  const res = await fetch(`${API_BASE_URL}/meals`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load meals');
  return res.json();
};

export const getMealById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/meals/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get meal');
  return res.json();
};

export const createMeal = async (data) => {
  const res = await fetch(`${API_BASE_URL}/meals`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (![200,201].includes(res.status)) throw new Error('Failed to create meal');
  try {
      return await res.json();
    } catch {
      return { message: 'Meal created successfully' };
    }
};

export const updateMeal = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/meals/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update meal');
  return res.json();
};

export const deleteMeal = async (id) => {
  const res = await fetch(`${API_BASE_URL}/meals/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete meal');
  return res.json();
};

// ==============================
// PROMOTION MANAGEMENT
// ==============================
export const getAllPromos = async () => {
  const res = await fetch(`${API_BASE_URL}/promotions`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load promotions');
  return res.json();
};

export const getPromoById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get promotion');
  return res.json();
};

export const createPromo = async (data) => {
  const res = await fetch(`${API_BASE_URL}/promotions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create promotion');
  }
  return res.json();
};

export const updatePromo = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update promotion');
  }
  return res.json();
};

export const deletePromo = async (id) => {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete promotion');
  }
  return res.json();
};

// ==============================
// CUSTOMER PROFILE & PAYMENT METHODS
// ==============================
export const getCustomerProfile = async () => {
  const res = await fetch(`${API_BASE_URL}/customers/profile`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get customer profile');
  return res.json();
};

export const updateCustomerProfile = async (data) => {
  const res = await fetch(`${API_BASE_URL}/customers/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update customer profile');
  return res.json();
};

export const getPaymentMethods = async () => {
  const res = await fetch(`${API_BASE_URL}/customers/payment-methods`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get payment methods');
  return res.json();
};

export const addPaymentMethod = async (data) => {
  const res = await fetch(`${API_BASE_URL}/customers/payment-methods`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add payment method');
  return res.json();
};

export const deletePaymentMethod = async (id) => {
  const res = await fetch(`${API_BASE_URL}/customers/payment-methods/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete payment method');
  return res.json();
};

// ==============================
// Token helper
// ==============================
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');
