export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const logout = () => {
  try {
    // Clear all storage
    localStorage.removeItem("token");
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
  window.location.replace("/login");
};