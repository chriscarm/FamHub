import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { secureStorage } from './storageService';
import Constants from 'expo-constants';

// Ensure WebBrowser is ready for auth redirects
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || '';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const scopes = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userInfo: GoogleUserInfo;
}

// Generate a random color for new accounts
const ACCOUNT_COLORS = [
  '#4A90A4', // Teal
  '#D4A574', // Gold
  '#9B59B6', // Purple
  '#E74C3C', // Red
  '#27AE60', // Green
  '#F39C12', // Orange
  '#3498DB', // Blue
  '#1ABC9C', // Turquoise
];

export function getRandomAccountColor(existingColors: string[]): string {
  const available = ACCOUNT_COLORS.filter(c => !existingColors.includes(c));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)];
}

// Get the redirect URI based on environment
export function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: 'smartdisplay',
  });
}

// Create auth request
export function useGoogleAuth() {
  const redirectUri = getRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  return { request, response, promptAsync };
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const response = await fetch(discovery.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// Refresh access token
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn?: number }> {
  const response = await fetch(discovery.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

// Fetch user info from Google
export async function fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}

// Revoke token (sign out)
export async function revokeToken(token: string): Promise<void> {
  await fetch(`${discovery.revocationEndpoint}?token=${token}`, {
    method: 'POST',
  });
}

// Store tokens securely
export async function storeTokens(
  accountId: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  await secureStorage.setToken(accountId, accessToken);
  if (refreshToken) {
    await secureStorage.setRefreshToken(accountId, refreshToken);
  }
}

// Retrieve tokens
export async function retrieveTokens(
  accountId: string
): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const accessToken = await secureStorage.getToken(accountId);
  const refreshToken = await secureStorage.getRefreshToken(accountId);
  return { accessToken, refreshToken };
}

// Remove tokens
export async function removeTokens(accountId: string): Promise<void> {
  await secureStorage.deleteToken(accountId);
  await secureStorage.deleteRefreshToken(accountId);
}

// Validate and refresh token if needed
export async function getValidAccessToken(accountId: string): Promise<string | null> {
  const { accessToken, refreshToken } = await retrieveTokens(accountId);

  if (!accessToken) {
    return null;
  }

  // Try to use existing token
  try {
    // Test the token by making a simple API call
    const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `access_token=${accessToken}`,
    });

    if (response.ok) {
      return accessToken;
    }
  } catch (error) {
    // Token might be expired, try to refresh
  }

  // Try to refresh if we have a refresh token
  if (refreshToken) {
    try {
      const { accessToken: newToken } = await refreshAccessToken(refreshToken);
      await secureStorage.setToken(accountId, newToken);
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  return null;
}
