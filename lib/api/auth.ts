import api from "../axios";
import { getApiBaseUrl, setAuthSession } from "../auth";
import type { AuthResponse, RegisterRequest, UserProfile } from "@/types";
import { extractApiError } from "./utils";

const AUTH_ENDPOINTS = {
  REGISTER: "/api/v1/auth/register",
  LOGIN: "/api/v1/auth/login",
  REFRESH_TOKEN: "/api/v1/auth/refresh-token",
} as const;

export async function register(data: RegisterRequest) {
  const response = await api.post<UserProfile>(AUTH_ENDPOINTS.REGISTER, data);
  return response.data;
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  const response = await fetch(`${getApiBaseUrl()}${AUTH_ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form.toString(),
  });

  if (!response.ok) {
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    throw new Error(extractApiError(payload, "Login failed"));
  }

  const data = (await response.json()) as AuthResponse;
  setAuthSession(data);
  return data;
}

export async function refreshTokenAPI() {
  const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN);
  setAuthSession(response.data);
  return response.data;
}
