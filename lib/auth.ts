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
  localStorage.removeItem("token");

  // ✅ IMPORTANT: replace (not push)
  window.location.replace("/login");
};