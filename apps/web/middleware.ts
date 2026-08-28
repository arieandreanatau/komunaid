import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { featureFlags } from "./lib/feature-flags";

const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW) {
  throw new Error(
    "[SECURITY] JWT_SECRET environment variable is required but not set. " +
    "Application cannot start without a valid JWT secret."
  );
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);

const protectedRoutes = [
  "/dashboard",
  "/communities/create",
];
const orgRoutes = [
  "/organizations",
  "/organizations/create",
  "/organizations/",
];
const adminProtectedRoutes = ["/admin"];
const adminGuestRoutes = ["/admin/login"];
const guestRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  type: string;
  roles?: string[];
  tokenVersion?: number;
  iat: number;
  exp: number;
}

async function verifyTokenLocally(token: string | undefined): Promise<{ valid: boolean; payload?: TokenPayload }> {
  if (!token || !JWT_SECRET.byteLength) return { valid: false };
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const typed = payload as unknown as TokenPayload;
    if (typed.type !== "access") return { valid: false };
    return { valid: true, payload: typed };
  } catch {
    return { valid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (!featureFlags.organization && orgRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  if (adminGuestRoutes.some((route) => pathname.startsWith(route))) {
    const result = await verifyTokenLocally(token);
    if (result.valid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (adminProtectedRoutes.some((route) => pathname.startsWith(route))) {
    const result = await verifyTokenLocally(token);
    if (!result.valid) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    const userRoles = result.payload?.roles || [];
    const hasAdminRole = userRoles.some((r: string) => r === "SUPER_ADMIN" || r === "PLATFORM_ADMIN");
    if (!hasAdminRole) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    return NextResponse.next();
  }

  // The legacy /communities/:slug/{edit,settings,join-requests} tree has been
  // retired (see next.config.js `redirects()`, which now sends those paths to
  // their canonical /dashboard/communities/:slug/* equivalents before requests
  // ever reach this middleware). Community owner/admin management now lives
  // exclusively under /dashboard/communities/:slug/*. That whole tree is
  // already covered by the generic "/dashboard" entry in `protectedRoutes`
  // below, but we spell out the settings/join-requests-equivalent paths
  // explicitly (`isCommunityManagementRoute`) so this gate stays intact and
  // documented even if `protectedRoutes` is ever narrowed.
  //
  // Limitation: the access token's `roles` claim is a PLATFORM-level claim
  // (SUPER_ADMIN / PLATFORM_ADMIN) — it carries no per-community role, so this
  // middleware cannot determine here whether the caller is a given
  // community's OWNER/ADMIN without an API round-trip (explicitly out of
  // scope for middleware per project conventions). The strongest correct
  // check available at this layer is "is this a valid, authenticated
  // session" — enforced below. Per-community authorization is enforced
  // server-side by `requireCommunityAdmin` on every
  // /communities/:id/dashboard, /communities/:id/settings,
  // /communities/:id/join-requests, etc. API call (see
  // apps/api/src/routes/communities.ts), and mirrored client-side by the
  // `isOwner` gate in apps/web/components/community-dashboard-route.tsx. Do
  // not treat this middleware check as a substitute for those checks.
  const segments = pathname.split("/").filter(Boolean);
  const isCommunityManagementRoute =
    segments.length >= 4 &&
    segments[0] === "dashboard" &&
    segments[1] === "communities" &&
    Boolean(segments[2]) &&
    (segments[3] === "settings" || segments[3] === "requests");

  if (isCommunityManagementRoute || protectedRoutes.some((route) => pathname.startsWith(route))) {
    const result = await verifyTokenLocally(token);
    if (!result.valid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (guestRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/communities/create",
    "/organizations",
    "/organizations/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
