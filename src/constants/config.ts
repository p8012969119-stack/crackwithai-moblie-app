import { NativeModules, Platform } from 'react-native';

const TUNNEL_URL = 'https://sorry-developmental-obligation-continue.trycloudflare.com/api';
const LOCAL_URL = 'http://127.0.0.1:5001/api';
const DEV_LAN_IP = '172.168.7.189';
const DEV_LAN_URL = `http://${DEV_LAN_IP}:5001/api`;
const USB_URL = 'http://169.254.33.184:5001/api';
const EMULATOR_URL = 'http://10.0.2.2:5001/api';

// Prioritize local loopback and LAN endpoints for rapid dev iteration, with tunnel for remote access
export const CANDIDATE_URLS = [
  LOCAL_URL,
  DEV_LAN_URL,
  TUNNEL_URL,
  USB_URL,
  EMULATOR_URL,
];

let dynamicApiBaseUrl: string | null = null;
let probePromise: Promise<string> | null = null;

export const setDynamicApiBaseUrl = (url: string | null) => {
  dynamicApiBaseUrl = url || null;
};

export const probeFastestApiUrl = async (): Promise<string> => {
  if (dynamicApiBaseUrl) {
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

    // Fast probe: Test Local, LAN, and Tunnel in parallel
    try {
      const fastest = await Promise.any([
        probe(LOCAL_URL, 1500),
        probe(DEV_LAN_URL, 2000),
        probe(TUNNEL_URL, 3000),
      ]);
      if (fastest) {
        setDynamicApiBaseUrl(fastest);
        return fastest;
      }
    } catch {
      // Probing failed; fallback safely
    }

    const fallback = Platform.OS === 'ios' ? LOCAL_URL : TUNNEL_URL;
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
  return Platform.OS === 'ios' ? LOCAL_URL : TUNNEL_URL;
};

export const getDevApiBaseUrl = (): string => {
  if (dynamicApiBaseUrl) {
    return dynamicApiBaseUrl;
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Pre-probe in background to detect fastest connection immediately
  void probeFastestApiUrl();

  // Extract host IP from Metro bundle URL if on iOS
  const scriptURL = typeof NativeModules !== 'undefined' ? NativeModules?.SourceCode?.scriptURL : undefined;
  if (scriptURL && typeof scriptURL === 'string' && /^https?:\/\//i.test(scriptURL)) {
    try {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
      if (match && match[1]) {
        const host = match[1];
        if (host === 'localhost' || host === '127.0.0.1') {
          return LOCAL_URL;
        }
        return `http://${host}:5001/api`;
      }
    } catch (_) {}
  }

  // On iOS Simulator / local devices, default to LOCAL_URL
  if (Platform.OS === 'ios') {
    return LOCAL_URL;
  }

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

export const getPublicCertificateUrl = (code: string): string => {
  const base = TUNNEL_URL.replace(/\/api\/?$/, '');
  return `${base}/verify/${encodeURIComponent(code)}`;
};

export const getPublicCertificatePdfUrl = (code: string): string => {
  const base = TUNNEL_URL.replace(/\/api\/?$/, '');
  return `${base}/verify/${encodeURIComponent(code)}/pdf`;
};
