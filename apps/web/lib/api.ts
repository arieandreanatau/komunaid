import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

let csrfToken: string | null = null;

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await axios.get(`${API_URL}/api/v1/auth/me`, {
      withCredentials: true,
      timeout: 5000,
    });
    const setCookie = res.headers["set-cookie"];
    if (setCookie) {
      const cookieStr = Array.isArray(setCookie) ? setCookie.join("; ") : setCookie;
      const tokenMatch = cookieStr.match(/csrf_token=([^;]+)/);
      if (tokenMatch) {
        csrfToken = decodeURIComponent(tokenMatch[1]);
        return csrfToken;
      }
    }
  } catch {}
  return getCsrfToken();
}

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  if (method && method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    if (!csrfToken) {
      csrfToken = getCsrfToken();
    }
    if (!csrfToken) {
      csrfToken = await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const setCookie = response.headers["set-cookie"];
    if (setCookie) {
      const cookieStr = Array.isArray(setCookie) ? setCookie.join("; ") : setCookie;
      const tokenMatch = cookieStr.match(/csrf_token=([^;]+)/);
      if (tokenMatch) {
        csrfToken = decodeURIComponent(tokenMatch[1]);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      csrfToken = null;
    }
    return Promise.reject(error);
  }
);

export default api;
