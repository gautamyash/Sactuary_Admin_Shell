/**
 * Axios API client for the Django backend.
 *
 * Responsibilities:
 *  - Attach the bearer access token to every request.
 *  - On a 401, attempt a single silent refresh via `/api/auth/token/refresh/`
 *    and replay the original request, queueing concurrent requests during the
 *    refresh so only one refresh happens at a time.
 *  - Normalize every failure into an `ApiError` for consistent UI handling.
 *
 * The client is transport-only and UI-agnostic; React Query and hooks build on
 * top of it. The backend is never modified — this simply speaks its contract.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_URL } from "@/config/site";
import { ApiError, messageFromData } from "@/lib/api/errors";
import { tokenStorage } from "@/lib/api/token-storage";
import { endpoints } from "@/lib/api/endpoints";

/** Callback invoked when refresh fails, so the app can clear session state. */
let onAuthFailure: (() => void) | null = null;
export function setAuthFailureHandler(handler: (() => void) | null) {
  onAuthFailure = handler;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// --- single-flight refresh handling -------------------------------------

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return false;
  try {
    const res = await axios.post(`${API_URL}${endpoints.auth.refresh}`, { refresh });
    const { access, refresh: nextRefresh } = res.data ?? {};
    if (!access) return false;
    tokenStorage.setTokens(access, nextRefresh);
    return true;
  } catch {
    return false;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Network / no-response failures.
    if (!error.response) {
      throw new ApiError(0, null, `Cannot reach the server at ${API_URL}.`);
    }

    const status = error.response.status;
    const isRefreshCall = original?.url?.includes(endpoints.auth.refresh);

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      refreshing = refreshing ?? refreshTokens();
      const ok = await refreshing;
      refreshing = null;
      if (ok) {
        const token = tokenStorage.getAccess();
        if (token) original.headers.set("Authorization", `Bearer ${token}`);
        return apiClient(original);
      }
      tokenStorage.clear();
      onAuthFailure?.();
    }

    throw new ApiError(status, error.response.data, messageFromData(error.response.data));
  },
);

/** Thin typed helpers over the axios instance. */
export const http = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    (await apiClient.get<T>(url, { params })).data,
  post: async <T>(url: string, body?: unknown): Promise<T> =>
    (await apiClient.post<T>(url, body)).data,
  patch: async <T>(url: string, body?: unknown): Promise<T> =>
    (await apiClient.patch<T>(url, body)).data,
  delete: async <T>(url: string): Promise<T> => (await apiClient.delete<T>(url)).data,
};
