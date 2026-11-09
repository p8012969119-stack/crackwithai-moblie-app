import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TUNNEL_URL = 'https://telling-explosion-enormous-participant.trycloudflare.com/api';
const LOCAL_URL = 'http://127.0.0.1:5001/api';
const DEV_LAN_URL = 'http://172.168.7.186:5001/api';
const DEV_LAN_URL_ALT = 'http://172.168.7.188:5001/api';
const USB_URL = 'http://169.254.33.184:5001/api';
const EMULATOR_URL = 'http://10.0.2.2:5001/api';

const FASTEST_URL_KEY = '@crackwithai_fastest_api_url';

// Prioritize the live public HTTPS Cloudflare tunnel first so all physical devices and networks succeed immediately
export const CANDIDATE_URLS = [
  TUNNEL_URL,
  DEV_LAN_URL,
  EMULATOR_URL,
  LOCAL_URL,
  DEV_LAN_URL_ALT,
  USB_URL,
];

let dynamicApiBaseUrl: string | null = TUNNEL_URL;
let probePromise: Promise<string> | null = null;

// Only restore cached URL if it is a valid, secure public URL to prevent trapped local IP issues
try {
  AsyncStorage.getItem(FASTEST_URL_KEY).then((cached) => {
    if (cached && cached.startsWith('https://')) {
      dynamicApiBaseUrl = cached;
    }
  }).catch(() => {});
} catch (_) {}

export const setDynamicApiBaseUrl = (url: string | null) => {
  dynamicApiBaseUrl = url || TUNNEL_URL;
  if (url) {
    AsyncStorage.setItem(FASTEST_URL_KEY, url).catch(() => {});
  }
};

export const probeFastestApiUrl = async (): Promise<string> => {
  if (dynamicApiBaseUrl && dynamicApiBaseUrl.startsWith('https://')) {
    return dynamicApiBaseUrl;
  }
  if (probePromise) {
    return probePromise;
  }

  probePromise = (async () => {
    const probe = async (url: string, timeoutMs: number): Promise<string> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const clean = url.replace(/\/+$/, '');
        const res = await fetch(`${clean}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.ok || res.status === 200 || res.status === 404) {
          return url;
        }
        throw new Error('HTTP ' + res.status);
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    };

    try {
      const candidates = [
        probe(TUNNEL_URL, 3500),
        probe(DEV_LAN_URL, 1500),
        probe(EMULATOR_URL, 1200),
        probe(LOCAL_URL, 1200),
      ];
      const fastest = await Promise.any(candidates);
      if (fastest) {
        setDynamicApiBaseUrl(fastest);
        return fastest;
      }
    } catch {
      // Probing failed; fallback safely to public tunnel
    }

    const fallback = TUNNEL_URL;
    setDynamicApiBaseUrl(fallback);
    return fallback;
  })();

  const result = await probePromise;
  probePromise = null;
  return result;
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

  return TUNNEL_URL;
};

// Environment & App Configuration
export const CONFIG = {
  get API_BASE_URL(): string {
    return getDevApiBaseUrl();
  },
  TIMEOUT: 10000,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@crackwithai_auth_token',
    USER_DATA: '@crackwithai_user_data',
    LANGUAGE: '@crackwithai_user_language',
    SETTINGS: '@crackwithai_settings',
    FASTEST_API_URL: FASTEST_URL_KEY,
  },
};

export const getPublicCertificateUrl = (code: string): string => {
  const base = (dynamicApiBaseUrl || TUNNEL_URL).replace(/\/api\/?$/, '');
  return `${base}/verify/${encodeURIComponent(code)}`;
};

export const getPublicCertificatePdfUrl = (code: string): string => {
  const base = (dynamicApiBaseUrl || TUNNEL_URL).replace(/\/api\/?$/, '');
  return `${base}/verify/${encodeURIComponent(code)}/pdf`;
};
