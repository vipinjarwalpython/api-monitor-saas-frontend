import axios from "axios";
import { shouldRefreshToken, refreshToken, logout } from "./auth";

// ✅ Create instance
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  failedQueue.forEach((callback) => callback(token));
  failedQueue = [];
};

// ✅ Request interceptor (attach token & check expiry)
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      // Check if token needs refresh
      if (shouldRefreshToken()) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            await refreshToken();
          } catch (error) {
            console.error("Token refresh failed in interceptor:", error);
            logout();
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
            processQueue(null);
          }
        }
      }

      const token = localStorage.getItem("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized (token expired or invalid)
    if (error?.response?.status === 401) {
      // Prevent infinite refresh loops
      if (originalRequest._retry) {
        logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const token = await refreshToken();
          processQueue(token);
          
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Queue request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
    }

    console.log("API ERROR:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;