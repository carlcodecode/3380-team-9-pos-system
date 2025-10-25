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
// Token helper
// ==============================
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');
