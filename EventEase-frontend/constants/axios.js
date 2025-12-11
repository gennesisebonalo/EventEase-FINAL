// constants/axios.js
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Server configuration with fallback options
// Determine Metro host IP for Expo Go (physical device) and emulator mapping
const getDefaultServerCandidates = () => {
  const candidates = [];
  // Preferred LAN IP provided by user
  const preferredLan = 'http://192.168.1.9:8000';
  candidates.push(preferredLan);
  try {
    const debuggerHost = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoClient?.hostUri || Constants?.manifest?.debuggerHost;
    // debuggerHost is like "192.168.1.12:8081" or "localhost:8081"
    if (typeof debuggerHost === 'string' && debuggerHost.includes(':')) {
      const host = debuggerHost.split(':')[0];
      if (host && host !== '127.0.0.1' && host !== 'localhost') {
        candidates.push(`http://${host}:8000`);
      }
    }
  } catch (_) {}

  if (Platform.OS === 'android') {
    // If running Android emulator, 10.0.2.2 maps to host machine
    candidates.push('http://10.0.2.2:8000');
  }

  // Local development fallbacks
  candidates.push('http://localhost:8000');
  candidates.push('http://127.0.0.1:8000');

  // Deduplicate while preserving order
  return Array.from(new Set(candidates));
};

const SERVER_CONFIGS = getDefaultServerCandidates();

let currentServerIndex = 0;
let LARAVEL_BASE_URL = SERVER_CONFIGS[currentServerIndex] || 'http://10.0.2.2:8000';

const api = axios.create({
  baseURL: LARAVEL_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // Reduced timeout for faster failure detection
});

// Enhanced request interceptor with better logging
api.interceptors.request.use(
  (config) => {
    try {
      console.log('[API] Request:', `${config.baseURL?.replace(/\/$/, '')}/${String(config.url || '').replace(/^\//, '')}`);
      console.log('[API] Method:', config.method?.toUpperCase());
      console.log('[API] Data:', config.data);
      
      // Add request timestamp for debugging
      config.metadata = { startTime: new Date() };
    } catch (error) {
      console.log('[API] Request logging error:', error);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with automatic server switching
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = response.config.metadata?.startTime 
      ? new Date() - response.config.metadata.startTime 
      : 'unknown';
    
    console.log('[API] Response:', response.status, response.data);
    console.log('[API] Duration:', `${duration}ms`);
    return response;
  },
  async (error) => {
    console.error('[API] Response error:', error);
    
    // Handle network errors (varies by Axios versions)
    const isNetworkError =
      error.isAxiosError && (
        error.code === 'ERR_NETWORK' ||
        error.code === 'NETWORK_ERROR' ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('network error'))
      );

    if (isNetworkError) {
      console.log('[API] Network error detected, trying next server...');
      
      // Try next server if available
      if (currentServerIndex < SERVER_CONFIGS.length - 1) {
        currentServerIndex++;
        LARAVEL_BASE_URL = SERVER_CONFIGS[currentServerIndex];
        api.defaults.baseURL = LARAVEL_BASE_URL;
        
        console.log('[API] Switched to server:', LARAVEL_BASE_URL);
        
        // Retry the original request using updated baseURL
        try {
          const originalConfig = { ...(error.config || {}) };

          // Remove stale baseURL if present to ensure axios uses api.defaults.baseURL
          delete originalConfig.baseURL;

          // Normalize URL: if absolute, strip the origin so axios combines with new baseURL
          if (typeof originalConfig.url === 'string') {
            try {
              const absoluteUrl = new URL(originalConfig.url, 'http://placeholder');
              // If url contains a protocol/host, convert to path+search only
              if (/^https?:/i.test(originalConfig.url)) {
                originalConfig.url = absoluteUrl.pathname + absoluteUrl.search + absoluteUrl.hash;
              }
            } catch (_) {
              // If URL constructor fails, keep url as-is
            }
          }

          return await api.request(originalConfig);
        } catch (retryError) {
          console.error('[API] Retry failed:', retryError);
          // If the retry failed with a NON-network error (e.g., 4xx/5xx),
          // propagate that error to the caller so they can handle validation/server errors.
          const isRetryNetworkError =
            retryError?.isAxiosError && (
              retryError.code === 'ERR_NETWORK' ||
              retryError.code === 'NETWORK_ERROR' ||
              (typeof retryError.message === 'string' && retryError.message.toLowerCase().includes('network error'))
            );
          if (!isRetryNetworkError) {
            return Promise.reject(retryError);
          }
        }
      }
      
      // All servers failed
      console.error('[API] All servers failed. Please check your network connection.');
    }
    
    return Promise.reject(error);
  }
);

// Function to reset server configuration
export const resetServerConfig = () => {
  currentServerIndex = 0;
  LARAVEL_BASE_URL = SERVER_CONFIGS[currentServerIndex];
  api.defaults.baseURL = LARAVEL_BASE_URL;
  console.log('[API] Reset to primary server:', LARAVEL_BASE_URL);
};

// Function to manually set server URL
export const setServerURL = (url) => {
  LARAVEL_BASE_URL = url;
  api.defaults.baseURL = LARAVEL_BASE_URL;
  console.log('[API] Manual server set:', LARAVEL_BASE_URL);
};

// Function to get current server URL
export const getCurrentServerURL = () => LARAVEL_BASE_URL;

// Function to get server configuration info
export const getServerInfo = () => ({
  current: LARAVEL_BASE_URL,
  index: currentServerIndex,
  total: SERVER_CONFIGS.length,
  all: SERVER_CONFIGS
});

// Function to test server connectivity
export const testServerConnection = async () => {
  try {
    const response = await api.get('/api/health', { timeout: 5000 });
    console.log('[API] Server connection test successful:', response.status);
    return true;
  } catch (error) {
    console.error('[API] Server connection test failed:', error);
    return false;
  }
};

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
    console.log('[API] Auth token set');
  } else {
    delete api.defaults.headers.Authorization;
    console.log('[API] Auth token removed');
  }
};

export default api;
