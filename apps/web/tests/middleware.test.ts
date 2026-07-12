import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
}));

import { jwtVerify } from "jose";
import { middleware } from "../middleware";

function createMockRequest(pathname: string, token?: string): NextRequest {
  const url = `https://example.com${pathname}`;
  const cookies = new Map<string, { value: string }>();
  if (token) {
    cookies.set("token", { value: token });
  }
  return {
    nextUrl: new URL(url),
    url,
    cookies: {
      get: (name: string) => cookies.get(name),
    },
  } as unknown as NextRequest;
}

const mockedJwtVerify = vi.mocked(jwtVerify);

function expectNoRedirect(res: Response) {
  expect(res.headers.get("location")).toBeNull();
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = "test-secret";
  process.env.NEXT_PUBLIC_ORGANIZATION_ENABLED = "false";
});

describe("middleware - org routes with ORG_ENABLED=false", () => {
  it("redirects to /not-found for /organizations", async () => {
    const req = createMockRequest("/organizations");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/not-found");
  });

  it("redirects to /not-found for /organizations/create", async () => {
    const req = createMockRequest("/organizations/create");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/not-found");
  });

  it("redirects to /not-found for /organizations/some-org", async () => {
    const req = createMockRequest("/organizations/my-org");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/not-found");
  });
});

describe("middleware - org routes with ORG_ENABLED=true", () => {
  it("allows /organizations when no token", async () => {
    process.env.NEXT_PUBLIC_ORGANIZATION_ENABLED = "true";
    vi.resetModules();
    const { middleware: mw } = await import("../middleware");
    const req = createMockRequest("/organizations");
    const res = await mw(req);
    expectNoRedirect(res);
  });
});

describe("middleware - admin routes", () => {
  it("redirects to /admin/login when no token on admin route", async () => {
    const req = createMockRequest("/admin");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("redirects to /admin/login with invalid token", async () => {
    mockedJwtVerify.mockRejectedValueOnce(new Error("invalid"));
    const req = createMockRequest("/admin", "invalid-token");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("allows admin route with valid token", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/admin", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows /admin/some-path with valid token", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/admin/settings", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });
});

describe("middleware - admin guest routes", () => {
  it("allows /admin/login when not authenticated", async () => {
    const req = createMockRequest("/admin/login");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("redirects authenticated user from /admin/login to /admin", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/admin/login", "valid-token");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin");
  });
});

describe("middleware - protected routes", () => {
  it("redirects to /login when no token on /dashboard", async () => {
    const req = createMockRequest("/dashboard");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).toContain("redirect=%2Fdashboard");
  });

  it("redirects to /login when no token on /communities/create", async () => {
    const req = createMockRequest("/communities/create");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).toContain("redirect=%2Fcommunities%2Fcreate");
  });

  it("allows /dashboard with valid token", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/dashboard", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows /dashboard/settings with valid token", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/dashboard/settings", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("redirects to /login with invalid token on /dashboard", async () => {
    mockedJwtVerify.mockRejectedValueOnce(new Error("invalid"));
    const req = createMockRequest("/dashboard", "bad-token");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });
});

describe("middleware - community management routes", () => {
  it("redirects to /login when no token on /communities/my-org/edit", async () => {
    const req = createMockRequest("/communities/my-org/edit");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects to /login when no token on /communities/my-org/settings", async () => {
    const req = createMockRequest("/communities/my-org/settings");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects to /login when no token on /communities/my-org/join-requests", async () => {
    const req = createMockRequest("/communities/my-org/join-requests");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("allows community management route with valid token", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/communities/my-org/edit", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });
});

describe("middleware - guest routes", () => {
  it("allows /login when not authenticated", async () => {
    const req = createMockRequest("/login");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows /register when not authenticated", async () => {
    const req = createMockRequest("/register");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows /forgot-password when not authenticated", async () => {
    const req = createMockRequest("/forgot-password");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("redirects authenticated user from /login to /dashboard", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/login", "valid-token");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("redirects authenticated user from /register to /dashboard", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/register", "valid-token");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("redirects authenticated user from /forgot-password to /dashboard", async () => {
    mockedJwtVerify.mockResolvedValueOnce({} as never);
    const req = createMockRequest("/forgot-password", "valid-token");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });
});

describe("middleware - unmatched routes", () => {
  it("allows non-matched routes through", async () => {
    const req = createMockRequest("/about");
    const res = await middleware(req);
    expectNoRedirect(res);
  });
});
