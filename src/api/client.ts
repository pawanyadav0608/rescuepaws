import axios from 'axios';

// Backend is FastAPI at /api base URL
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Safe local storage reader
const safeGetToken = (): string | null => {
  try {
    return localStorage.getItem('rescue_jwt_token');
  } catch {
    return null;
  }
};

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = safeGetToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to reject HTML fallback responses (when backend API endpoint is not present)
apiClient.interceptors.response.use(
  (response) => {
    // If Vite dev server returned HTML fallback for an API route
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!') || response.data.trim().startsWith('<html'))
    ) {
      return Promise.reject(new Error('API server returned HTML fallback instead of JSON'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
