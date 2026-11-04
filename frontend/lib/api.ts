import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("kvp_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(error)) return error.response?.data?.detail || fallback;
  return fallback;
}

