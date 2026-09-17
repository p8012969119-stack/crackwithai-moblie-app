import { NativeModules, Platform } from 'react-native';

export const getDevApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Extract host IP from Metro bundle URL if running in development mode
  const scriptURL = typeof NativeModules !== 'undefined' ? NativeModules?.SourceCode?.scriptURL : undefined;
  if (scriptURL) {
    const host = scriptURL.split('://')[1]?.split(':')[0];
    if (host) {
      return `http://${host}:5001/api`;
    }
  }

  // Fallback for Android emulator vs iOS simulator / Node environment
  if (typeof Platform !== 'undefined' && Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';
  }
  return 'http://127.0.0.1:5001/api';
};

// Environment & App Configuration
export const CONFIG = {
  get API_BASE_URL(): string {
    return getDevApiBaseUrl();
  },
  TIMEOUT: 45000,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@crackwithai_auth_token',
    USER_DATA: '@crackwithai_user_data',
    LANGUAGE: '@crackwithai_user_language',
    SETTINGS: '@crackwithai_settings',
  },
};

