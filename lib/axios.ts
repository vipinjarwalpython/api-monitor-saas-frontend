import axios from "axios";

// ✅ Create instance
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
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
  (error) => {
    console.log("API ERROR:", error?.response?.data || error.message);

    // 🔥 Handle unauthorized (token expired)
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");

        // redirect to login
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;