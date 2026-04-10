import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../lib/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
});

const ACCESS_KEY = 'townly_access_token';
const REFRESH_KEY = 'townly_refresh_token';

// Attach access token to every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getItem(ACCESS_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh access token on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await storage.getItem(REFRESH_KEY);
      if (!refreshToken) throw error;

      try {
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        await storage.setItem(ACCESS_KEY, data.accessToken);
        await storage.setItem(REFRESH_KEY, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch {
        await storage.deleteItem(ACCESS_KEY);
        await storage.deleteItem(REFRESH_KEY);
        throw error;
      }
    }
    throw error;
  },
);
