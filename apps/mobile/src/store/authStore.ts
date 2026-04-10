import { create } from 'zustand';
import { User } from '@townly/shared';
import { storage } from '../lib/storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  restoreAuth: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

const ACCESS_KEY = 'townly_access_token';
const REFRESH_KEY = 'townly_refresh_token';
const USER_KEY = 'townly_user';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await Promise.all([
      storage.setItem(ACCESS_KEY, accessToken),
      storage.setItem(REFRESH_KEY, refreshToken),
      storage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
    set({ user, accessToken, refreshToken });
  },

  clearAuth: async () => {
    await Promise.all([
      storage.deleteItem(ACCESS_KEY),
      storage.deleteItem(REFRESH_KEY),
      storage.deleteItem(USER_KEY),
    ]);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  restoreAuth: async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        storage.getItem(ACCESS_KEY),
        storage.getItem(REFRESH_KEY),
        storage.getItem(USER_KEY),
      ]);
      const user = userJson ? JSON.parse(userJson) : null;
      set({ user, accessToken, refreshToken, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateUser: (partial) =>
    set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
}));
