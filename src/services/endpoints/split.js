// src/services/endpoints/splits.js

const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const makeRequest = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || data?.detail || data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ============ SPLIT ENDPOINTS ============

export const getSplitsEndpoint = async () => {
  const data = await makeRequest(`${API_BASE_URL}/splits/`);
  return data?.data || [];
};

export const getSplitByIdEndpoint = async (id) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/${id}/`);
  return data?.data || data;
};

export const getMySplitsEndpoint = async () => {
  const data = await makeRequest(`${API_BASE_URL}/splits/my_splits/`);
  return data?.data || [];
};

export const createSplitEndpoint = async (formData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/splits/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData, // Keep as FormData, don't stringify
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || data?.detail || 'Failed to create split');
  }
  return data?.data || data;
};


export const updateSplitEndpoint = async (id, splitData) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(splitData),
  });
  return data?.data || data;
};

export const deleteSplitEndpoint = async (id) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/${id}/`, {
    method: 'DELETE',
  });
  return data;
};

export const joinSplitEndpoint = async (splitId, paymentData = {}) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/${splitId}/join_splits/`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
  return data?.data || data;
};