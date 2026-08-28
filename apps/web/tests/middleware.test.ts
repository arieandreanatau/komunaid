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
const memberPayload = { payload: { sub: "user-1", type: "access", roles: ["MEMBER"] } } as never;
const adminPayload = { payload: { sub: "admin-1", type: "access", roles: ["PLATFORM_ADMIN"] } } as never;

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
    mockedJwtVerify.mockResolvedValueOnce(adminPayload);
    const req = createMockRequest("/admin", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows /admin/some-path with valid token", async () => {
    mockedJwtVerify.mockResolvedValueOnce(adminPayload);
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
    mockedJwtVerify.mockResolvedValueOnce(adminPayload);
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
    mockedJwtVerify.mockResolvedValueOnce(memberPayload);
    const req = createMockRequest("/dashboard", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows /dashboard/settings with valid token", async () => {
    mockedJwtVerify.mockResolvedValueOnce(memberPayload);
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
  // The legacy /communities/:slug/{edit,settings,join-requests} tree is retired;
  // those paths are now redirected to their canonical
  // /dashboard/communities/:slug/* equivalents via next.config.js `redirects()`
  // (checked before middleware ever runs), not via this middleware. Community
  // owner/admin management now lives exclusively under
  // /dashboard/communities/:slug/*, so the gating below targets that tree.
  it("redirects to /login when no token on /dashboard/communities/my-org/settings", async () => {
    const req = createMockRequest("/dashboard/communities/my-org/settings");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects to /login when no token on /dashboard/communities/my-org/requests", async () => {
    const req = createMockRequest("/dashboard/communities/my-org/requests");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("redirects to /login with invalid token on /dashboard/communities/my-org/settings", async () => {
    mockedJwtVerify.mockRejectedValueOnce(new Error("invalid"));
    const req = createMockRequest("/dashboard/communities/my-org/settings", "bad-token");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("allows community management route with valid token", async () => {
    mockedJwtVerify.mockResolvedValueOnce(memberPayload);
    const req = createMockRequest("/dashboard/communities/my-org/settings", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows a community's other dashboard tabs with valid token (covered by the broader /dashboard/:path* gate)", async () => {
    mockedJwtVerify.mockResolvedValueOnce(memberPayload);
    const req = createMockRequest("/dashboard/communities/my-org/overview", "valid-token");
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

  it("allows authenticated user to revisit /login", async () => {
    mockedJwtVerify.mockResolvedValueOnce(memberPayload);
    const req = createMockRequest("/login", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows authenticated user to revisit /register", async () => {
    mockedJwtVerify.mockResolvedValueOnce(memberPayload);
    const req = createMockRequest("/register", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });

  it("allows authenticated user to revisit /forgot-password", async () => {
    mockedJwtVerify.mockResolvedValueOnce(memberPayload);
    const req = createMockRequest("/forgot-password", "valid-token");
    const res = await middleware(req);
    expectNoRedirect(res);
  });
});

describe("middleware - unmatched routes", () => {
  it("allows non-matched routes through", async () => {
    const req = createMockRequest("/about");
    const res = await middleware(req);
    expectNoRedirect(res);
  });
});
