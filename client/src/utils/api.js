let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (BASE_URL && !BASE_URL.endsWith('/api') && !BASE_URL.endsWith('/api/')) {
  if (BASE_URL.endsWith('/')) {
    BASE_URL = BASE_URL.slice(0, -1);
  }
  BASE_URL = BASE_URL + '/api';
}

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('saas_jwt_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Check if unauthorized, trigger auto-logout
    if (response.status === 401) {
      localStorage.removeItem('saas_jwt_token');
      localStorage.removeItem('saas_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return null;
    }

    if (response.status === 444) {
      // Custom status for "not found"
      const data = await response.json();
      throw new Error(data.message || 'Resource not found');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    }

    if (!response.ok) {
      throw new Error('API Request failed');
    }
    
    return true; // Simple success boolean for non-json responses
  } catch (error) {
    console.error(`💥 API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
};

export default api;
