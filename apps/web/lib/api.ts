import axios from "axios";

const API_URL = "";

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
  } catch {
    // Ignore errors during CSRF fetch
  }
  return null;
}

function getCsrfToken(): string | null {
  if (csrfToken) return csrfToken;
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    if (match) {
      csrfToken = match[1];
      return csrfToken;
    }
  }
  return null;
}

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._url?.includes("/auth/me")) {
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
