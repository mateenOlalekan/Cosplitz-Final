// services/splitService.js
const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api/api';

const request = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.status === 'success') {
      return data.data || data;
    }
    
    throw new Error(data.message || 'Request failed');
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const splitService = {
  getSplits: async () => {
    try {
      const response = await request('/splits/', { method: 'GET' });
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Error fetching splits:', error);
      return [];
    }
  },

  createSplit: async (splitData) => {
    const formattedData = {
      ...splitData,
      amount: splitData.amount || 0,
      max_participants: splitData.max_participants || 1,
      visibility_radius: splitData.visibility_radius || 0,
      rules: splitData.rules || null,
      image_url: splitData.image_url || null,
    };
    
    return request('/splits/', {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });
  },

  updateSplit: async (id, splitData) => {
    return request(`/splits/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(splitData),
    });
  },

  getSplitDetails: async (id) => {
    return request(`/splits/${id}/`, { method: 'GET' });
  },

  joinSplit: async (splitId, userId) => {
    return request(`/splits/${splitId}/join_splits/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  getSplitParticipants: async (splitId) => {
    return request(`/splits/${splitId}/participants/`, { method: 'GET' });
  },
};