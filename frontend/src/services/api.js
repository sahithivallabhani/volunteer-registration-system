const API_URL = 'http://localhost:5000/api';

// Helper to get headers with JWT if available
const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Response helper
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    register: async (userData) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    login: async (credentials) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    getProfile: async () => {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    updateProfile: async (profileData) => {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      return handleResponse(res);
    }
  },

  // Events
  events: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/events`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    create: async (eventData) => {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData)
      });
      return handleResponse(res);
    },
    update: async (id, eventData) => {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(eventData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Registrations
  registrations: {
    register: async (eventId) => {
      const res = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ eventId })
      });
      return handleResponse(res);
    },
    getMy: async () => {
      const res = await fetch(`${API_URL}/registrations/my`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getAll: async () => {
      const res = await fetch(`${API_URL}/registrations`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    updateStatus: async (id, status) => {
      const res = await fetch(`${API_URL}/registrations/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    }
  },

  // Hours Logging
  hours: {
    log: async (logData) => {
      const res = await fetch(`${API_URL}/hours`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(logData)
      });
      return handleResponse(res);
    },
    getMy: async () => {
      const res = await fetch(`${API_URL}/hours/my`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getAll: async () => {
      const res = await fetch(`${API_URL}/hours`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    approve: async (id, status) => {
      const res = await fetch(`${API_URL}/hours/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    }
  },

  // Analytics & Stats
  reports: {
    getAnalytics: async () => {
      const res = await fetch(`${API_URL}/reports/analytics`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },
  
  volunteer: {
    getStats: async () => {
      const res = await fetch(`${API_URL}/volunteer/stats`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  }
};
