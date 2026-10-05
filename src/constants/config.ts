import { NativeModules, Platform } from 'react-native';

const TUNNEL_URL = 'https://bathroom-continuing-defines-grill.trycloudflare.com/api';
const USB_URL = 'http://169.254.33.184:5001/api';
const LOCAL_URL = 'http://127.0.0.1:5001/api';
const EMULATOR_URL = 'http://10.0.2.2:5001/api';
const DEV_LAN_IP = '172.168.9.185';
const DEV_LAN_URL = `http://${DEV_LAN_IP}:5001/api`;

const CANDIDATE_URLS = [
  TUNNEL_URL,
  DEV_LAN_URL,
  USB_URL,
  LOCAL_URL,
  EMULATOR_URL,
];

let dynamicApiBaseUrl: string | null = null;

export const setDynamicApiBaseUrl = (url: string | null) => {
  dynamicApiBaseUrl = url || null;
};

export const getAlternateApiBaseUrl = (currentUrl: string): string | null => {
  const cleanCurrent = (currentUrl || '').trim().replace(/\/$/, '');
  const currentIndex = CANDIDATE_URLS.findIndex(url => url.replace(/\/$/, '') === cleanCurrent);
  if (currentIndex >= 0) {
    const nextIndex = (currentIndex + 1) % CANDIDATE_URLS.length;
    return CANDIDATE_URLS[nextIndex];
  }
  return TUNNEL_URL;
};

export const getDevApiBaseUrl = (): string => {
  if (dynamicApiBaseUrl) {
    return dynamicApiBaseUrl;
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // On Android physical & emulator devices with ADB reverse, 127.0.0.1:5001 is direct, zero-latency USB loopback
  if (Platform.OS === 'android') {
    return LOCAL_URL;
  }

  // Extract host IP from Metro bundle URL if on iOS
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

  // On physical iOS device or when running bundled JS, use HTTPS tunnel or local LAN
  return TUNNEL_URL;
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
