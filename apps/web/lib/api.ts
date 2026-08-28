import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import type { ApiResponse, PaginatedResponse } from "@komunaid/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

let csrfToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
}

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await axios.get(`${API_URL}/api/v1/auth/me`, { withCredentials: true });
    const token = res.headers["x-csrf-token"];
    if (token) {
      csrfToken = token;
      return token;
    }
  } catch (err: any) {
    const token = err?.response?.headers?.["x-csrf-token"];
    if (token) {
      csrfToken = token;
      return token;
    }
  }
  return null;
}

function getCsrfToken(): string | null {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    if (match) {
      csrfToken = match[1];
      return csrfToken;
    }
  }
  csrfToken = null;
  return null;
}

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Unwrap the `{ success: true, data }` envelope documented in CLAUDE.md
 * ("API conventions" -> Envelopes) and typed in
 * `packages/shared/src/response.ts`. Axios already rejects non-2xx
 * responses, so a well-behaved endpoint never resolves here with
 * `success: false` -- the check exists to narrow the type, and to fail
 * loudly instead of silently returning `undefined` if that assumption
 * is ever wrong.
 *
 * This -- plus `apiGet`/`apiGetPaginated`/`apiPost`/`apiPut`/`apiPatch`/
 * `apiDelete` below -- is the ONLY place in the web app that unwraps the
 * envelope. Existing call sites that read `response.data.data` off the raw
 * `api` instance are untouched by this file; only code written or migrated
 * to use these helpers (or the `useApiQuery`/`useApiMutation` hooks in
 * `hooks/useApi.ts`, which are built on top of them) gets automatic
 * unwrapping. Do not make `api` itself unwrap -- that would silently break
 * every one of those existing call sites.
 */
export function unwrapApiResponse<T>(payload: ApiResponse<T>): T {
  if (!payload.success) {
    throw new Error(payload.error?.message || "Request failed");
  }
  return payload.data;
}

/** GET a single-resource (non-paginated) endpoint and unwrap its envelope. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, config);
  return unwrapApiResponse(res.data);
}

/**
 * GET a paginated list endpoint (one built with `paginatedResponse()` on
 * the API side). Returns the full envelope -- `data` and `pagination` --
 * since list UIs need both, unlike `apiGet`'s single-value unwrap.
 */
export async function apiGetPaginated<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<PaginatedResponse<T>> {
  const res = await api.get<PaginatedResponse<T>>(url, config);
  return res.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body, config);
  return unwrapApiResponse(res.data);
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.put<ApiResponse<T>>(url, body, config);
  return unwrapApiResponse(res.data);
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.patch<ApiResponse<T>>(url, body, config);
  return unwrapApiResponse(res.data);
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete<ApiResponse<T>>(url, config);
  return unwrapApiResponse(res.data);
}

api.interceptors.request.use(async (config) => {
  if (config.method && config.method !== "get" && config.method !== "head" && config.method !== "options") {
    let token = getCsrfToken();
    if (!token) {
      token = await fetchCsrfToken();
    }
    if (token) {
      config.headers["X-CSRF-Token"] = token;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const newCsrfToken = response.headers["x-csrf-token"];
    if (newCsrfToken) {
      csrfToken = newCsrfToken;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && error.response?.data?.message?.includes("CSRF") && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      const newToken = await fetchCsrfToken();
      if (newToken) {
        originalRequest.headers["X-CSRF-Token"] = newToken;
        return api(originalRequest);
      }
    }

    const retryExcluded = ["/auth/me", "/auth/refresh", "/auth/login"];
    if (error.response?.status === 401 && !originalRequest._retry && !retryExcluded.some((p) => originalRequest.url?.includes(p))) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
