import { NativeModules, Platform } from 'react-native';

const DEV_LAN_IP = '172.168.12.169';
let dynamicApiBaseUrl: string | null = null;

export const setDynamicApiBaseUrl = (url: string) => {
  dynamicApiBaseUrl = url;
};

export const getAlternateApiBaseUrl = (currentUrl: string): string | null => {
  if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1') || currentUrl.includes('10.0.2.2')) {
    return `http://${DEV_LAN_IP}:5001/api`;
  }
  if (currentUrl.includes(DEV_LAN_IP)) {
    return 'http://localhost:5001/api';
  }
  return null;
};

export const getDevApiBaseUrl = (): string => {
  if (dynamicApiBaseUrl) {
    return dynamicApiBaseUrl;
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Extract host IP from Metro bundle URL if running in development mode
  const scriptURL = typeof NativeModules !== 'undefined' ? NativeModules?.SourceCode?.scriptURL : undefined;
  if (scriptURL && typeof scriptURL === 'string') {
    const host = scriptURL.split('://')[1]?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5001/api`;
    }
  }

  // Physical Android connected via USB with adb reverse uses localhost:5001.
  // Physical Android on local Wi-Fi or when reverse is not running will automatically
  // fail over to DEV_LAN_IP (172.168.12.169:5001) via client interceptor.
  if (typeof Platform !== 'undefined' && Platform.OS === 'android') {
    return 'http://localhost:5001/api';
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

