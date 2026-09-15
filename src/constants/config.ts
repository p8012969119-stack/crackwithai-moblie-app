import { NativeModules, Platform } from 'react-native';

const getDevApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Extract host IP from Metro bundle URL if running in development mode
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const host = scriptURL.split('://')[1]?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5001/api`;
    }
  }

  // Fallback to local Wi-Fi IP for physical iOS devices, or 127.0.0.1 for simulator
  return 'http://172.168.12.169:5001/api';
};

// Environment & App Configuration
export const CONFIG = {
  API_BASE_URL: getDevApiBaseUrl(),
  TIMEOUT: 45000,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@crackwithai_auth_token',
    USER_DATA: '@crackwithai_user_data',
    LANGUAGE: '@crackwithai_user_language',
    SETTINGS: '@crackwithai_settings',
  },
};

