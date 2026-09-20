const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return 'http://localhost:5001/api';
    }
  }
  return 'https://animalhelpingfoundation-web.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

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
    throw new Error('Payment server is currently connecting or busy. Please try again in a few moments.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || defaultErrorMessage);
  }
  return data;
};

// Safe fetch with 1 auto-retry for handling mobile network hiccups or server cold starts
const safeFetch = async (url, options = {}, retries = 1) => {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      console.warn('[API] Initial fetch failed, retrying in 1.5s...', err.message);
      await new Promise(r => setTimeout(r, 1500));
      return await fetch(url, options);
    }
    throw err;
  }
};

export const api = {
  // Image Upload API
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    return handleResponse(res, 'Failed to upload image from device');
  },

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

  // Donation & Payment APIs
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

  // Razorpay Payment Gateway APIs
  createRazorpayOrder: async (amount, campaignId) => {
    const res = await safeFetch(`${API_BASE_URL}/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, campaignId })
    });
    return handleResponse(res, 'Failed to create Razorpay payment order');
  },

  verifyRazorpayPayment: async (paymentData) => {
    const res = await safeFetch(`${API_BASE_URL}/razorpay/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    return handleResponse(res, 'Payment verification failed');
  },

  getAdminDonations: async (campaignId = null) => {
    const url = campaignId ? `${API_BASE_URL}/admin/donations?campaignId=${campaignId}` : `${API_BASE_URL}/admin/donations`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(res, 'Failed to fetch admin donations list');
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
  },

  // Contact Queries APIs
  submitContactQuery: async (queryData) => {
    const res = await safeFetch(`${API_BASE_URL}/queries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryData)
    });
    return handleResponse(res, 'Failed to submit contact query');
  },

  getAdminQueries: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/queries`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res, 'Failed to fetch contact queries');
  },

  updateQueryStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/admin/queries/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res, 'Failed to update query status');
  },

  deleteQuery: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/queries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res, 'Failed to delete query');
  }
};
