import type { AuthResponse, AuthUser, StoredAuthSession } from "@/types";

const AUTH_STORAGE_KEY = "api-monitor-auth";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getApiBaseUrl() {
  return API_BASE;
}

export function getStoredSession(): StoredAuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

export function setAuthSession(payload: AuthResponse | StoredAuthSession) {
  if (!canUseStorage()) {
    return;
  }

  const session: StoredAuthSession =
    "access_token" in payload
      ? {
          token: payload.access_token,
          user: payload.user,
        }
      : payload;

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function updateStoredUser(user: AuthUser | null) {
  const current = getStoredSession();
  if (!current?.token) {
    return;
  }

  setAuthSession({
    token: current.token,
    user,
  });
}

export function getToken() {
  return getStoredSession()?.token ?? null;
}

export function getStoredUser() {
  return getStoredSession()?.user ?? null;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function refreshToken() {
  const token = getToken();

  if (!token) {
    clearAuthSession();
    return null;
  }

  const response = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthSession();
    }

    throw new Error("Session refresh failed");
  }

  const data = (await response.json()) as AuthResponse;
  setAuthSession(data);
  return data.access_token;
}

export function logout(options?: { redirect?: boolean }) {
  clearAuthSession();

  if (options?.redirect === false || !canUseStorage()) {
    return;
  }

  window.location.replace("/login");
}
