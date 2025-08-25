// Authentication persistence utilities
import { User } from '@/contexts/auth/types';

const AUTH_USER_KEY = 'tvet_auth_user';
const AUTH_TOKEN_KEY = 'tvet_auth_token';

export const saveUserToStorage = (user: User): void => {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user to localStorage:', error);
  }
};

export const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to get user from localStorage:', error);
    return null;
  }
};

export const removeUserFromStorage = (): void => {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove user from localStorage:', error);
  }
};

export const saveTokenToStorage = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token to localStorage:', error);
  }
};

export const getTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token from localStorage:', error);
    return null;
  }
};
