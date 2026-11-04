import type { User } from "./types-auth";

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("kvp_user");
  return raw ? JSON.parse(raw) : null;
};

export const saveSession = (token: string, user: User) => {
  window.localStorage.setItem("kvp_token", token);
  window.localStorage.setItem("kvp_user", JSON.stringify(user));
};

export const clearSession = () => {
  window.localStorage.removeItem("kvp_token");
  window.localStorage.removeItem("kvp_user");
};

