const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : 'https://animalhelpingfoundation-web.onrender.com/api');

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res, defaultErrorMessage) => {
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Backend API server is offline or unreachable. Please check backend connection.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || defaultErrorMessage);
  }
  return data;
};

export const api = {
  // Auth APIs
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res, 'Login failed');
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res, 'Authentication error');
  },

  // Stats API
  getStats: async () => {
    const res = await fetch(`${API_BASE_URL}/stats`);
    return handleResponse(res, 'Failed to load stats');
  },

  // Featured Campaigns APIs
  getFeatured: async () => {
    const res = await fetch(`${API_BASE_URL}/featured`);
    return handleResponse(res, 'Failed to load featured campaigns');
  },

  updateFeatured: async (featuredIds) => {
    const res = await fetch(`${API_BASE_URL}/featured`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ featuredIds })
    });
    return handleResponse(res, 'Failed to update featured campaigns');
  },

  // Campaign APIs
  getCampaigns: async (status = null) => {
    const url = status ? `${API_BASE_URL}/campaigns?status=${status}` : `${API_BASE_URL}/campaigns`;
    const res = await fetch(url);
    return handleResponse(res, 'Failed to fetch campaigns');
  },

  getCampaignById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${id}`);
    return handleResponse(res, 'Failed to fetch campaign details');
  },

  createCampaign: async (campaignData) => {
    const res = await fetch(`${API_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData)
    });
    return handleResponse(res, 'Failed to create campaign');
  },

  updateCampaign: async (id, campaignData) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData)
    });
    return handleResponse(res, 'Failed to update campaign');
  },

  deleteCampaign: async (id) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res, 'Failed to delete campaign');
  },

  // Additional Content Cards APIs
  addContentCard: async (campaignId, cardData) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/cards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cardData)
    });
    return handleResponse(res, 'Failed to add content card');
  },

  updateContentCard: async (campaignId, cardId, cardData) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/cards/${cardId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(cardData)
    });
    return handleResponse(res, 'Failed to update content card');
  },

  deleteContentCard: async (campaignId, cardId) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/cards/${cardId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res, 'Failed to delete content card');
  },

  reorderContentCards: async (campaignId, cardIds) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/cards/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cardIds })
    });
    return handleResponse(res, 'Failed to reorder content cards');
  },

  // Donation APIs
  createDonation: async (donationData) => {
    const res = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData)
    });
    return handleResponse(res, 'Failed to process donation');
  },

  getCampaignDonations: async (campaignId) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/donations`);
    return handleResponse(res, 'Failed to fetch campaign donor list');
  },

  // Blog / Stories APIs
  getBlogs: async () => {
    const res = await fetch(`${API_BASE_URL}/blogs`);
    return handleResponse(res, 'Failed to fetch blog stories');
  },

  createBlog: async (blogData) => {
    const res = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData)
    });
    return handleResponse(res, 'Failed to create blog story');
  },

  updateBlog: async (id, blogData) => {
    const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData)
    });
    return handleResponse(res, 'Failed to update blog story');
  },

  deleteBlog: async (id) => {
    const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res, 'Failed to delete blog story');
  }
};
