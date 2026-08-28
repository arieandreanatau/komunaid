import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * lib/api.ts carries the whole client-side auth protocol documented in
 * CLAUDE.md ("Web app"): a CSRF token read from the `csrf_token` cookie
 * (refetched from `/auth/me` headers on a CSRF 403), plus a single-flight
 * 401 -> `POST /auth/refresh` -> replay queue, with `/auth/me`,
 * `/auth/refresh`, `/auth/login` excluded from retry. None of that had a
 * test before; this file mocks `axios` itself (there is no HTTP mock
 * adapter in this workspace) so the interceptor callbacks registered by
 * lib/api.ts can be invoked directly, without a real network.
 */

const { mockInstance, mockAxiosGet, mockAxiosCreate } = vi.hoisted(() => {
  // The exported `api` instance IS this object, since our mocked
  // `axios.create()` always returns it -- axios instances are callable
  // (`api(config)` retries a request), so this must be a function too.
  const instance: any = vi.fn(() => Promise.resolve({ data: {} }));
  instance.get = vi.fn();
  instance.post = vi.fn();
  instance.put = vi.fn();
  instance.patch = vi.fn();
  instance.delete = vi.fn();
  instance.interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  return {
    mockInstance: instance,
    mockAxiosGet: vi.fn(),
    mockAxiosCreate: vi.fn(() => instance),
  };
});

vi.mock("axios", () => ({
  default: {
    create: mockAxiosCreate,
    get: mockAxiosGet,
  },
}));

function getRequestInterceptor() {
  return mockInstance.interceptors.request.use.mock.calls[0][0] as (config: any) => any;
}

function getResponseInterceptors() {
  const [onFulfilled, onRejected] = mockInstance.interceptors.response.use.mock.calls[0];
  return { onFulfilled, onRejected } as {
    onFulfilled: (response: any) => any;
    onRejected: (error: any) => any;
  };
}

function setCookie(value: string | null) {
  if (value === null) {
    // jsdom has no direct "delete cookie" API; expiring it is the standard way.
    document.cookie = "csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  } else {
    document.cookie = `csrf_token=${value}`;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  setCookie(null);
});

describe("api instance wiring", () => {
  it("is created once via axios.create with the versioned baseURL and credentials", async () => {
    await import("../../lib/api");
    expect(mockAxiosCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.stringContaining("/api/v1"),
        withCredentials: true,
      }),
    );
  });

  it("registers exactly one request interceptor and one response interceptor", async () => {
    await import("../../lib/api");
    expect(mockInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(mockInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
  });
});

describe("CSRF request interceptor", () => {
  it("attaches X-CSRF-Token from the csrf_token cookie on a non-GET request", async () => {
    await import("../../lib/api");
    setCookie("cookie-token-123");
    const requestInterceptor = getRequestInterceptor();

    const config = await requestInterceptor({ method: "post", headers: {} });

    expect(config.headers["X-CSRF-Token"]).toBe("cookie-token-123");
  });

  it("does not attach a CSRF header to GET requests", async () => {
    await import("../../lib/api");
    setCookie("cookie-token-123");
    const requestInterceptor = getRequestInterceptor();

    const config = await requestInterceptor({ method: "get", headers: {} });

    expect(config.headers["X-CSRF-Token"]).toBeUndefined();
  });

  it("does not attach a CSRF header to HEAD/OPTIONS requests", async () => {
    await import("../../lib/api");
    setCookie("cookie-token-123");
    const requestInterceptor = getRequestInterceptor();

    const headConfig = await requestInterceptor({ method: "head", headers: {} });
    const optionsConfig = await requestInterceptor({ method: "options", headers: {} });

    expect(headConfig.headers["X-CSRF-Token"]).toBeUndefined();
    expect(optionsConfig.headers["X-CSRF-Token"]).toBeUndefined();
  });

  it("fetches a CSRF token from /auth/me when no cookie is present", async () => {
    await import("../../lib/api");
    mockAxiosGet.mockResolvedValueOnce({ headers: { "x-csrf-token": "fetched-token" } });
    const requestInterceptor = getRequestInterceptor();

    const config = await requestInterceptor({ method: "post", headers: {} });

    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/me"),
      expect.objectContaining({ withCredentials: true }),
    );
    expect(config.headers["X-CSRF-Token"]).toBe("fetched-token");
  });

  it("falls back to the CSRF token on a failed /auth/me response's headers", async () => {
    await import("../../lib/api");
    mockAxiosGet.mockRejectedValueOnce({
      response: { headers: { "x-csrf-token": "token-from-error" } },
    });
    const requestInterceptor = getRequestInterceptor();

    const config = await requestInterceptor({ method: "post", headers: {} });

    expect(config.headers["X-CSRF-Token"]).toBe("token-from-error");
  });

  it("proceeds without a CSRF header when no token can be found anywhere", async () => {
    await import("../../lib/api");
    mockAxiosGet.mockRejectedValueOnce(new Error("network down"));
    const requestInterceptor = getRequestInterceptor();

    const config = await requestInterceptor({ method: "post", headers: {} });

    expect(config.headers["X-CSRF-Token"]).toBeUndefined();
  });
});

describe("response interceptor: CSRF 403 retry", () => {
  it("refetches the CSRF token and retries once on a CSRF-rejected 403", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();
    mockAxiosGet.mockResolvedValueOnce({ headers: { "x-csrf-token": "new-token" } });
    mockInstance.mockResolvedValueOnce({ data: { success: true } });

    const originalRequest: any = { headers: {}, url: "/communities" };
    const error = {
      config: originalRequest,
      response: { status: 403, data: { message: "Invalid CSRF token" } },
    };

    const result = await onRejected(error);

    expect(originalRequest._csrfRetry).toBe(true);
    expect(originalRequest.headers["X-CSRF-Token"]).toBe("new-token");
    expect(mockInstance).toHaveBeenCalledWith(originalRequest);
    expect(result).toEqual({ data: { success: true } });
  });

  it("does not retry a second time once _csrfRetry is already set", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();

    const originalRequest: any = { headers: {}, url: "/communities", _csrfRetry: true };
    const error = {
      config: originalRequest,
      response: { status: 403, data: { message: "Invalid CSRF token" } },
    };

    await expect(onRejected(error)).rejects.toBe(error);
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });

  it("does not treat a non-CSRF 403 as a CSRF failure", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();

    const originalRequest: any = { headers: {}, url: "/communities" };
    const error = {
      config: originalRequest,
      response: { status: 403, data: { message: "Forbidden" } },
    };

    await expect(onRejected(error)).rejects.toBe(error);
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });
});

describe("response interceptor: 401 refresh-and-replay", () => {
  it("refreshes the session and retries the original request on a 401", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();
    mockInstance.post.mockResolvedValueOnce({ data: { success: true } });
    mockInstance.mockResolvedValueOnce({ data: { ok: true } });

    const originalRequest: any = { headers: {}, url: "/communities/mine" };
    const error = { config: originalRequest, response: { status: 401 } };

    const result = await onRejected(error);

    expect(mockInstance.post).toHaveBeenCalledWith("/auth/refresh");
    expect(originalRequest._retry).toBe(true);
    expect(mockInstance).toHaveBeenCalledWith(originalRequest);
    expect(result).toEqual({ data: { ok: true } });
  });

  it("rejects and does not retry again when the refresh call itself fails", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();
    const refreshError = new Error("refresh failed");
    mockInstance.post.mockRejectedValueOnce(refreshError);

    const originalRequest: any = { headers: {}, url: "/communities/mine" };
    const error = { config: originalRequest, response: { status: 401 } };

    await expect(onRejected(error)).rejects.toBe(refreshError);
    expect(mockInstance.post).toHaveBeenCalledTimes(1);
  });

  it("does not attempt a refresh for a 401 on excluded paths (/auth/me, /auth/refresh, /auth/login)", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();

    for (const url of ["/auth/me", "/auth/refresh", "/auth/login"]) {
      const originalRequest: any = { headers: {}, url };
      const error = { config: originalRequest, response: { status: 401 } };
      await expect(onRejected(error)).rejects.toBe(error);
    }
    expect(mockInstance.post).not.toHaveBeenCalled();
  });

  it("does not retry a 401 a second time once _retry is already set", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();

    const originalRequest: any = { headers: {}, url: "/communities/mine", _retry: true };
    const error = { config: originalRequest, response: { status: 401 } };

    await expect(onRejected(error)).rejects.toBe(error);
    expect(mockInstance.post).not.toHaveBeenCalled();
  });

  it("queues concurrent 401s behind a single in-flight refresh (single-flight)", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();

    let resolveRefresh: (value: unknown) => void;
    mockInstance.post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    mockInstance.mockResolvedValue({ data: { ok: true } });

    const requestA: any = { headers: {}, url: "/a" };
    const requestB: any = { headers: {}, url: "/b" };
    const errorA = { config: requestA, response: { status: 401 } };
    const errorB = { config: requestB, response: { status: 401 } };

    const resultAPromise = onRejected(errorA);
    const resultBPromise = onRejected(errorB);

    // Only the first 401 triggers the refresh call; the second queues.
    expect(mockInstance.post).toHaveBeenCalledTimes(1);

    resolveRefresh!({ data: { success: true } });
    const [resultA, resultB] = await Promise.all([resultAPromise, resultBPromise]);

    expect(resultA).toEqual({ data: { ok: true } });
    expect(resultB).toEqual({ data: { ok: true } });
    expect(mockInstance).toHaveBeenCalledWith(requestA);
    expect(mockInstance).toHaveBeenCalledWith(requestB);
  });

  it("rejects every queued request when the shared refresh fails", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();

    let rejectRefresh: (reason: unknown) => void;
    const refreshError = new Error("refresh failed");
    mockInstance.post.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectRefresh = reject;
      }),
    );

    const requestA: any = { headers: {}, url: "/a" };
    const requestB: any = { headers: {}, url: "/b" };
    const errorA = { config: requestA, response: { status: 401 } };
    const errorB = { config: requestB, response: { status: 401 } };

    const resultAPromise = onRejected(errorA);
    const resultBPromise = onRejected(errorB);

    rejectRefresh!(refreshError);

    await expect(resultAPromise).rejects.toBe(refreshError);
    await expect(resultBPromise).rejects.toBe(refreshError);
  });

  it("passes through non-401/403 errors unchanged", async () => {
    await import("../../lib/api");
    const { onRejected } = getResponseInterceptors();

    const originalRequest: any = { headers: {}, url: "/communities" };
    const error = { config: originalRequest, response: { status: 500 } };

    await expect(onRejected(error)).rejects.toBe(error);
  });
});

describe("response interceptor: success path", () => {
  it("passes a response with an updated CSRF token header through unchanged", async () => {
    await import("../../lib/api");
    const { onFulfilled } = getResponseInterceptors();
    const response = { headers: { "x-csrf-token": "rotated-token" }, data: {} };

    expect(onFulfilled(response)).toBe(response);
  });

  it("passes a response with no CSRF token header through unchanged", async () => {
    await import("../../lib/api");
    const { onFulfilled } = getResponseInterceptors();
    const response = { headers: {}, data: { success: true } };

    expect(onFulfilled(response)).toBe(response);
  });
});

describe("envelope unwrap helpers", () => {
  it("unwrapApiResponse returns .data from a success envelope", async () => {
    const { unwrapApiResponse } = await import("../../lib/api");
    expect(unwrapApiResponse({ success: true, data: { id: "1" } })).toEqual({ id: "1" });
  });

  it("unwrapApiResponse throws using the error envelope's message on failure", async () => {
    const { unwrapApiResponse } = await import("../../lib/api");
    expect(() =>
      unwrapApiResponse({ success: false, error: { code: "NOT_FOUND", message: "Tidak ditemukan" } }),
    ).toThrow("Tidak ditemukan");
  });

  it("apiGet unwraps a single-resource envelope", async () => {
    const { apiGet } = await import("../../lib/api");
    mockInstance.get.mockResolvedValueOnce({ data: { success: true, data: { id: "42" } } });

    const result = await apiGet<{ id: string }>("/things/42");

    expect(mockInstance.get).toHaveBeenCalledWith("/things/42", undefined);
    expect(result).toEqual({ id: "42" });
  });

  it("apiGetPaginated returns the full envelope with data and pagination", async () => {
    const { apiGetPaginated } = await import("../../lib/api");
    const envelope = {
      success: true,
      data: [{ id: "1" }, { id: "2" }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };
    mockInstance.get.mockResolvedValueOnce({ data: envelope });

    const result = await apiGetPaginated<{ id: string }>("/things");

    expect(result).toEqual(envelope);
  });

  it("apiPost unwraps the envelope returned by a mutation", async () => {
    const { apiPost } = await import("../../lib/api");
    mockInstance.post.mockResolvedValueOnce({ data: { success: true, data: { id: "created" } } });

    const result = await apiPost<{ id: string }>("/things", { name: "x" });

    expect(mockInstance.post).toHaveBeenCalledWith("/things", { name: "x" }, undefined);
    expect(result).toEqual({ id: "created" });
  });
});
