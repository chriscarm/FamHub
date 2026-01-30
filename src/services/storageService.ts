import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  ACCOUNTS: 'family_hub_accounts',
  SYNC_SETTINGS: 'family_hub_sync_settings',
  APP_PREFERENCES: 'family_hub_preferences',
} as const;

// For sensitive data like tokens, use SecureStore
export const secureStorage = {
  async setToken(accountId: string, token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(`token_${accountId}`, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  async getToken(accountId: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(`token_${accountId}`);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  async deleteToken(accountId: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(`token_${accountId}`);
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  },

  async setRefreshToken(accountId: string, token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(`refresh_${accountId}`, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  },

  async getRefreshToken(accountId: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(`refresh_${accountId}`);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  },

  async deleteRefreshToken(accountId: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(`refresh_${accountId}`);
    } catch (error) {
      console.error('Error deleting refresh token:', error);
    }
  },
};

// For non-sensitive app data, use AsyncStorage
export const appStorage = {
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  // Specific storage methods
  async saveAccounts(accounts: any[]): Promise<void> {
    // Remove sensitive tokens before saving to AsyncStorage
    const sanitizedAccounts = accounts.map(({ accessToken, refreshToken, ...rest }) => rest);
    await this.setItem(STORAGE_KEYS.ACCOUNTS, sanitizedAccounts);
  },

  async loadAccounts(): Promise<any[] | null> {
    return this.getItem(STORAGE_KEYS.ACCOUNTS);
  },

  async saveSyncSettings(settings: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.SYNC_SETTINGS, settings);
  },

  async loadSyncSettings(): Promise<any | null> {
    return this.getItem(STORAGE_KEYS.SYNC_SETTINGS);
  },

  async savePreferences(preferences: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.APP_PREFERENCES, preferences);
  },

  async loadPreferences(): Promise<any | null> {
    return this.getItem(STORAGE_KEYS.APP_PREFERENCES);
  },

  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export default {
  secure: secureStorage,
  app: appStorage,
};
