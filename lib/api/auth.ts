import api from "../axios";
import { setToken } from "../auth";
import type { RegisterRequest, RegisterResponse, LoginResponse } from "@/types";

const AUTH_ENDPOINTS = {
  REGISTER: "/api/v1/auth/register",
  LOGIN: "/api/v1/auth/login",
  REFRESH_TOKEN: "/api/v1/auth/refresh-token",
};

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, data);
  return response.data;
};

/**
 * Login user
 * POST /api/v1/auth/login
 * Note: This endpoint expects form-encoded body, not JSON
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const response = await fetch("http://localhost:8000" + AUTH_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!response.ok) {
    let errorMessage = "Login failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.details || errorData.detail || errorData.error || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    throw error;
  }

  const data: LoginResponse = await response.json();
  
  // Store token with expiry
  setToken(data.access_token, data.expires_in);
  
  return data;
};

/**
 * Refresh token
 * POST /api/v1/auth/refresh-token
 */
export const refreshTokenAPI = async (): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN);
  
  if (response.data.access_token) {
    setToken(response.data.access_token, response.data.expires_in);
  }
  
  return response.data;
};
