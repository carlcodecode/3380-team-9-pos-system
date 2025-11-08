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
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error('Failed to load low stock alerts');
  return await res.json();
};

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
  if (![200, 201].includes(res.status)) throw new Error('Failed to create meal');
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
// MEAL TYPE MANAGEMENT
// ==============================

export const getAllMealCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/meal-categories`);
  if (!res.ok) throw new Error('Failed to load meal categories');
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

export const validatePromoCode = async (code) => {
  const res = await fetch(`${API_BASE_URL}/promotions/validate/${code}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Invalid promo code');
  }
  return res.json();
};

export const getPromoAnalytics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);

  const res = await fetch(`${API_BASE_URL}/promotions/analytics?${queryParams}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to get promotion analytics');
  }
  return res.json();
};

// ==============================
// SEASONAL DISCOUNT / SALE EVENT MANAGEMENT
// ==============================
export const getAllSaleEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/sale-events`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load sale events');
  return res.json();
};

export const getSaleEventById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/sale-events/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get sale event');
  return res.json();
};

export const createSaleEvent = async (data) => {
  const res = await fetch(`${API_BASE_URL}/sale-events`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (![200, 201].includes(res.status)) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create sale event');
  }
  return res.json();
};

export const updateSaleEvent = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/sale-events/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update sale event');
  }
  return res.json();
};

export const deleteSaleEvent = async (id) => {
  const res = await fetch(`${API_BASE_URL}/sale-events/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete sale event');
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

export const markDeliveryAlertResolved = async (eventId) => {
  const res = await fetch(`${API_BASE_URL}/triggers/alerts/${eventId}/resolve`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to resolve alert');
  return res.json();
};

// ==============================
// ORDERS
// ==============================
export const getCustomerOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get orders');
  return res.json();
};

export const getAllOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/orders/all`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get all orders');
  return res.json();
};

export const getOrderById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get order');
  return res.json();
};

export const createOrder = async (data) => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
};

export const updateOrder = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update order');
  return res.json();
};

export const updateOrderStatus = async (id, status) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ orderStatus: status }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
};

export const getCustomerDeliveryAlerts = async (customerId) => {
  const res = await fetch(`${API_BASE_URL}/triggers/alerts/customer/${customerId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch customer alerts');
  return res.json();
};
// ==============================
// Token helper
// ==============================
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');

// ==============================
// ADMIN REPORTS
// ==============================
export const getStaffMealCreatedReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.staff_id) queryParams.append('staff_id', params.staff_id);

  const res = await fetch(`${API_BASE_URL}/admin/reports/staff-meal-created?${queryParams}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get staff meal created report');
  return res.json();
};

export const getStaffMealUpdatedReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.staff_id) queryParams.append('staff_id', params.staff_id);

  const res = await fetch(`${API_BASE_URL}/admin/reports/staff-meal-updated?${queryParams}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get staff meal updated report');
  return res.json();
};

export const getMealSalesReport = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);

  const res = await fetch(`${API_BASE_URL}/admin/reports/meal-sales?${queryParams}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get meal sales report');
  return res.json();
};
