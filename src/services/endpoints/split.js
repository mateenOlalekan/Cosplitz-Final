// src/services/endpoints/splits.js
// Centralized API endpoints for splits

const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

// ============ TOKEN HELPER ============

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// ============ REQUEST HELPER ============

async function makeRequest(url, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.detail || `Request failed (${response.status})`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ============ ENDPOINTS ============

/**
 * Get all splits
 * GET /api/splits/
 * 
 * @returns {Promise<Array>} Array of split objects
 */
export const getSplitsEndpoint = async () => {
  const data = await makeRequest(`${API_BASE_URL}/splits/`, {
    method: 'GET',
  });

  console.log('[Splits] Fetched:', data);
  return data?.data || data || [];
};

/**
 * Get split by ID
 * GET /api/splits/:id/
 * 
 * @param {number|string} id - Split ID
 * @returns {Promise<Object>} Split data
 */
export const getSplitByIdEndpoint = async (id) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/${id}/`, {
    method: 'GET',
  });

  return data?.data || data;
};

/**
 * Create a new split
 * POST /api/splits/
 * 
 * @param {Object} splitData - Split data
 * @param {string} splitData.title - Split title
 * @param {string} splitData.category - Category (Housing, Food, Transport, etc.)
 * @param {number} splitData.amount - Total amount
 * @param {number} splitData.max_participants - Maximum participants
 * @param {string} splitData.split_method - Split method (Equal, Percentage, SpecificAmounts)
 * @param {string} splitData.location - Location
 * @param {string} [splitData.image_url] - Optional image URL
 * @returns {Promise<Object>} Created split data
 */
export const createSplitEndpoint = async (splitData) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/`, {
    method: 'POST',
    body: JSON.stringify(splitData),
  });

  return data?.data || data;
};

/**
 * Update a split
 * PUT /api/splits/:id/
 * 
 * @param {number|string} id - Split ID
 * @param {Object} splitData - Updated split data
 * @returns {Promise<Object>} Updated split data
 */
export const updateSplitEndpoint = async (id, splitData) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(splitData),
  });

  console.log('[Splits] Updated:', data);
  return data?.data || data;
};

/**
 * Partially update a split
 * PATCH /api/splits/:id/
 * 
 * @param {number|string} id - Split ID
 * @param {Object} splitData - Partial split data to update
 * @returns {Promise<Object>} Updated split data
 */
export const patchSplitEndpoint = async (id, splitData) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(splitData),
  });

  console.log('[Splits] Patched:', data);
  return data?.data || data;
};

/**
 * Delete a split
 * DELETE /api/splits/:id/
 * 
 * @param {number|string} id - Split ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteSplitEndpoint = async (id) => {
  const data = await makeRequest(`${API_BASE_URL}/splits/${id}/`, {
    method: 'DELETE',
  });

  return data?.data || data;
};