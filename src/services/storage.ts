import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

class StorageService {
  private memoryFallback = new Map<string, string>();

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Storage] Failed to save to AsyncStorage (${key}), using memory fallback`, e);
      this.memoryFallback.set(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
      return this.memoryFallback.get(key) || null;
    } catch (e) {
      console.warn(`[Storage] Failed to read from AsyncStorage (${key}), trying memory fallback`, e);
      return this.memoryFallback.get(key) || null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to remove from AsyncStorage (${key})`, e);
    }
    this.memoryFallback.delete(key);
  }

  async saveToken(token: string): Promise<void> {
    await this.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getToken(): Promise<string | null> {
    return await this.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  async removeToken(): Promise<void> {
    await this.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  async saveUser(user: any): Promise<void> {
    await this.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  async getUser(): Promise<any | null> {
    const data = await this.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async removeUser(): Promise<void> {
    await this.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('[Storage] Failed to clear AsyncStorage', e);
    }
    this.memoryFallback.clear();
  }
}

export const storage = new StorageService();
