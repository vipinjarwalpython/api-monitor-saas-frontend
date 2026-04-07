const API_BASE = "http://localhost:8000";
let refreshTokenTimeout: NodeJS.Timeout | null = null;

export const setToken = (token: string, expiresIn?: number) => {
  localStorage.setItem("token", token);
  
  if (expiresIn) {
    // Store expiry time (current time + expires_in seconds)
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem("token_expires", expiryTime.toString());
    
    // Schedule refresh 1 minute before expiry
    scheduleTokenRefresh(expiresIn);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const getTokenExpiry = () => {
  if (typeof window !== "undefined") {
    const expiry = localStorage.getItem("token_expires");
    return expiry ? parseInt(expiry, 10) : null;
  }
  return null;
};

export const isTokenExpired = () => {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  return Date.now() > expiry;
};

export const shouldRefreshToken = () => {
  const expiry = getTokenExpiry();
  if (!expiry) return false;
  // Refresh if less than 1 minute remaining
  return Date.now() > expiry - 60000;
};

export const scheduleTokenRefresh = (expiresIn: number) => {
  if (refreshTokenTimeout) {
    clearTimeout(refreshTokenTimeout);
  }
  
  // Refresh 1 minute before expiry
  const refreshTime = (expiresIn - 60) * 1000;
  
  if (typeof window !== "undefined") {
    refreshTokenTimeout = setTimeout(() => {
      refreshToken().catch((error) => {
        console.error("Token refresh failed:", error);
      });
    }, refreshTime);
  }
};

export const refreshToken = async () => {
  try {
    const token = getToken();
    if (!token) {
      logout();
      return null;
    }

    const response = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
      }
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    setToken(data.access_token, data.expires_in);
    return data.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    logout();
    return null;
  }
};

export const logout = () => {
  try {
    // Clear refresh timeout
    if (refreshTokenTimeout) {
      clearTimeout(refreshTokenTimeout);
      refreshTokenTimeout = null;
    }

    // Clear all storage
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires");
    localStorage.removeItem("user");
    localStorage.removeItem("auth-token");
    localStorage.clear();
    
    sessionStorage.clear();
    
    // Clear cookies if any
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  // ✅ IMPORTANT: replace (not push)
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
};