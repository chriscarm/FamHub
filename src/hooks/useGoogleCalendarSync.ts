import { useEffect, useRef, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useAppStore } from '../stores/appStore';
import {
  useGoogleAuth,
  exchangeCodeForTokens,
  fetchUserInfo,
  storeTokens,
  removeTokens,
  getRandomAccountColor,
  getRedirectUri,
} from '../services/authService';
import { fetchCalendars, syncAllAccountEvents } from '../services/calendarService';
import { GoogleAccount } from '../types';

export function useGoogleCalendarSync() {
  const {
    accounts,
    syncSettings,
    isSyncing,
    addAccount,
    removeAccount,
    updateAccountCalendars,
    updateAccountColor,
    toggleAccountCalendar,
    setEvents,
    setSyncing,
    updateSyncTime,
    toggleAutoSync,
  } = useAppStore();

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Google auth hook
  const { request, response, promptAsync } = useGoogleAuth();

  // Handle auth response
  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthSuccess(response);
    }
  }, [response]);

  // Auto-sync interval
  useEffect(() => {
    if (syncSettings.autoSyncEnabled && accounts.length > 0) {
      // Initial sync
      syncAllCalendars();

      // Set up interval
      syncIntervalRef.current = setInterval(
        syncAllCalendars,
        syncSettings.syncIntervalMinutes * 60 * 1000
      );
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncSettings.autoSyncEnabled, syncSettings.syncIntervalMinutes, accounts.length]);

  const handleAuthSuccess = async (response: AuthSession.AuthSessionResult) => {
    if (response.type !== 'success' || !response.params.code) {
      console.error('Auth failed:', response);
      return;
    }

    try {
      setSyncing(true);

      const redirectUri = getRedirectUri();

      // Exchange code for tokens
      const { accessToken, refreshToken } = await exchangeCodeForTokens(
        response.params.code,
        request?.codeVerifier || '',
        redirectUri
      );

      // Fetch user info
      const userInfo = await fetchUserInfo(accessToken);

      // Check if account already exists
      const existingAccount = accounts.find((a) => a.email === userInfo.email);
      if (existingAccount) {
        console.log('Account already connected');
        setSyncing(false);
        return;
      }

      // Store tokens securely
      await storeTokens(userInfo.id, accessToken, refreshToken);

      // Get a color not already used
      const existingColors = accounts.map((a) => a.color);
      const color = getRandomAccountColor(existingColors);

      // Create account object
      const newAccount: GoogleAccount = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        color,
        calendars: [],
        selectedCalendarIds: [],
      };

      // Add account to store
      addAccount(newAccount);

      // Fetch calendars
      const { calendars } = await fetchCalendars(userInfo.id);
      updateAccountCalendars(userInfo.id, calendars);

      // Sync events
      await syncAllCalendars();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const addGoogleAccount = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  const removeGoogleAccount = useCallback(
    async (accountId: string) => {
      // Remove tokens
      await removeTokens(accountId);
      // Remove from store
      removeAccount(accountId);
    },
    [removeAccount]
  );

  const syncAllCalendars = useCallback(async () => {
    if (accounts.length === 0) return;

    setSyncing(true);

    try {
      // Refresh calendars for all accounts
      for (const account of accounts) {
        const { calendars } = await fetchCalendars(account.id);
        if (calendars.length > 0) {
          updateAccountCalendars(account.id, calendars);
        }
      }

      // Sync events
      const accountsWithCalendars = accounts.map((a) => ({
        id: a.id,
        name: a.name,
        color: a.color,
        picture: a.picture,
        selectedCalendarIds: a.selectedCalendarIds,
      }));

      const { events, errors } = await syncAllAccountEvents(accountsWithCalendars);

      if (errors.length > 0) {
        console.warn('Sync errors:', errors);
      }

      setEvents(events);
      updateSyncTime();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  }, [accounts, setEvents, setSyncing, updateSyncTime, updateAccountCalendars]);

  return {
    accounts,
    syncSettings,
    isSyncing,
    isAuthReady: !!request,
    addGoogleAccount,
    removeGoogleAccount,
    syncAllCalendars,
    updateAccountColor,
    toggleAccountCalendar,
    toggleAutoSync,
  };
}
