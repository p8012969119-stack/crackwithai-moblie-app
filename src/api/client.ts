import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { CONFIG, getDevApiBaseUrl, getAlternateApiBaseUrl, setDynamicApiBaseUrl } from '../constants/config';
import { storage } from '../services/storage';

type UnauthorizedCallback = () => void;
let unauthorizedListener: UnauthorizedCallback | null = null;

export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string, public requiresVerification?: boolean) {
    super(message);
    this.name = 'ApiError';
  }
}

export const setUnauthorizedListener = (listener: UnauthorizedCallback | null) => {
  unauthorizedListener = listener;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// Request Interceptor: Inject JWT token into Authorization header and ensure current baseURL
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.baseURL = config.baseURL || CONFIG.API_BASE_URL;
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Unauthorized and API errors cleanly
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    // Automatic transparent retry on alternate network host (e.g. LAN IP -> localhost or vice versa)
    const config = error.config as (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined;
    const isNetworkOrTimeout = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    if (config && (!config._retryCount || config._retryCount < 1) && isNetworkOrTimeout) {
      const currentBase = config.baseURL || CONFIG.API_BASE_URL;
      const altBase = getAlternateApiBaseUrl(currentBase);
      if (altBase && altBase !== currentBase) {
        config._retryCount = (config._retryCount || 0) + 1;
        config.baseURL = altBase;
        setDynamicApiBaseUrl(altBase);
        try {
          return await apiClient(config);
        } catch (retryErr) {
          // Alternate retry also failed, continue to standard error formatting
        }
      }
    }
    if (error.response?.status === 401) {
      const currentToken = await storage.getToken();
      const requestAuth = error.config?.headers?.Authorization || error.config?.headers?.authorization;
      const requestToken = typeof requestAuth === 'string' ? requestAuth.replace(/^Bearer\s+/i, '') : null;
      if (!requestToken || !currentToken || requestToken === currentToken) {
        await storage.removeToken();
        await storage.removeUser();
        if (unauthorizedListener) {
          unauthorizedListener();
        }
      }
    }

    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // Never log Axios error/config objects: they contain authorization headers.
      console.info('[API request failed]', {
        method: error.config?.method?.toUpperCase(),
        baseURL: (error.config?.baseURL || CONFIG.API_BASE_URL || '').replace(/\/\/[^/@]+@/, '//[redacted]@').split(/[?#]/)[0],
        endpoint: error.config?.url?.split(/[?#]/)[0],
        status: error.response?.status ?? null,
        transport: timedOut ? 'timeout' : error.response ? 'http' : 'network',
        code: error.code,
        timeoutMs: error.config?.timeout,
        authorizationPresent: Boolean(error.config?.headers?.Authorization || error.config?.headers?.authorization),
        responseSuccess: typeof error.response?.data?.success === 'boolean' ? error.response.data.success : undefined,
        responseMessagePresent: typeof error.response?.data?.message === 'string',
        hint: !error.response && !timedOut
          ? 'Check the API listener on port 5001. Simulator loopback reaches this Mac; a physical iPhone needs the Mac LAN address and local-network permission.'
          : undefined,
      });
    }
    const message = timedOut ? 'The server took too long to respond. Please try again.' :
      error.response?.status >= 500 ? 'The service is temporarily unavailable. Please try again shortly.' :
      error.response?.status === 401 ? 'Your session has expired. Please sign in again.' :
      error.response?.data?.message ||
      (!error.response ? 'Unable to connect to CrackWithAI. Check your connection and try again.' : error.message) ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject(new ApiError(message, error.response?.status, error.response?.data?.code || error.code, error.response?.data?.requiresVerification));
  }
);

export default apiClient;
