import { NativeModules } from 'react-native';

const DEV_LAN_IP = '172.168.6.95';
const DEV_LAN_URL = `http://${DEV_LAN_IP}:5001/api`;
const LOCAL_URL = 'http://localhost:5001/api';

let dynamicApiBaseUrl: string | null = null;

export const setDynamicApiBaseUrl = (url: string) => {
  dynamicApiBaseUrl = url;
};

export const getAlternateApiBaseUrl = (currentUrl: string): string | null => {
  if (currentUrl.includes(DEV_LAN_IP)) {
    return LOCAL_URL;
  }
  if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
    return DEV_LAN_URL;
  }
  return DEV_LAN_URL;
};

export const getDevApiBaseUrl = (): string => {
  if (dynamicApiBaseUrl) {
    return dynamicApiBaseUrl;
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Extract host IP from Metro bundle URL (e.g. http://172.168.6.95:8081/index.bundle?...)
  const scriptURL = typeof NativeModules !== 'undefined' ? NativeModules?.SourceCode?.scriptURL : undefined;
  if (scriptURL && typeof scriptURL === 'string' && /^https?:\/\//i.test(scriptURL)) {
    try {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
      if (match && match[1]) {
        const host = match[1];
        if (host !== 'localhost' && host !== '127.0.0.1') {
          return `http://${host}:5001/api`;
        }
      }
    } catch (_) {}
  }

  // Use Mac LAN IP so physical iPhone devices on local Wi-Fi and simulators can reach port 5001
  return DEV_LAN_URL;
};

// Environment & App Configuration
export const CONFIG = {
  get API_BASE_URL(): string {
    return getDevApiBaseUrl();
  },
  TIMEOUT: 12000,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@crackwithai_auth_token',
    USER_DATA: '@crackwithai_user_data',
    LANGUAGE: '@crackwithai_user_language',
    SETTINGS: '@crackwithai_settings',
  },
};

