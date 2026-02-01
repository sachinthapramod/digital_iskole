/**
 * API Client with automatic token refresh
 * Handles 401 errors by refreshing the token and retrying the request
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Log API URL in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL);
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  // If already refreshing, wait for that promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('digital-iskole-refresh-token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Token refresh failed');
      }

      const newToken = data.data?.token;
      if (newToken) {
        localStorage.setItem('digital-iskole-token', newToken);
        return newToken;
      }

      throw new Error('No token in refresh response');
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear tokens and redirect to login
      localStorage.removeItem('digital-iskole-token');
      localStorage.removeItem('digital-iskole-refresh-token');
      localStorage.removeItem('digital-iskole-user');
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Make an API request with automatic token refresh on 401
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('digital-iskole-token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No token found in localStorage for request to:', endpoint);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error: any) {
    // Network error or CORS issue
    const errorMessage = error?.message || 'Unknown error'
    const errorDetails = {
      endpoint: `${API_URL}${endpoint}`,
      error: errorMessage,
      API_URL,
      errorType: error?.name || 'NetworkError',
    }
    
    console.error('API request failed:', errorDetails);
    
    // Provide more helpful error message
    if (errorMessage === 'Failed to fetch' || errorMessage.includes('fetch')) {
      throw new Error(
        `Unable to connect to the server. Please check:\n` +
        `1. The backend server is running (http://localhost:3001)\n` +
        `2. The API URL is correct: ${API_URL}\n` +
        `3. CORS is properly configured\n` +
        `4. Check browser console for more details`
      );
    }
    
    throw error;
  }

  // If token expired or invalid, try to refresh and retry
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    const errorCode = data.error?.code || data.code;
    const errorMessage = data.error?.message || data.message || 'Authorization required';

    if (errorCode === 'AUTH_TOKEN_EXPIRED' || errorCode === 'AUTH_TOKEN_INVALID') {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
        // If retry still returns 401, don't return it – throw so caller can show login message
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      throw new Error(errorMessage || 'Session expired. Please log in again.');
    }
  }

  return response;
}

/**
 * Helper function to parse JSON response
 */
export async function apiRequestJson<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiRequest(endpoint, options);
  return response.json();
}
