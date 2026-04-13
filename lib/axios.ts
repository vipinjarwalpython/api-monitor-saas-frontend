import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl, getToken, logout, refreshToken } from "./auth";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
  },
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

function attachToken(config: InternalAxiosRequestConfig, token: string) {
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${token}`;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    attachToken(config, token);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequest | undefined;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/api/v1/auth/login")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }

          attachToken(originalRequest, token);
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const token = await refreshToken();

      flushQueue(token);

      if (!token) {
        logout();
        return Promise.reject(error);
      }

      attachToken(originalRequest, token);
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(null);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
