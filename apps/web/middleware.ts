import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ORG_ENABLED = process.env.NEXT_PUBLIC_ORGANIZATION_ENABLED === "true";
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

  if (!ORG_ENABLED && orgRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
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

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const result = await verifyTokenLocally(token);
    if (!result.valid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length >= 3 &&
    segments[0] === "communities" &&
    segments[1] &&
    (segments[2] === "edit" || segments[2] === "settings" || segments[2] === "join-requests")
  ) {
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
    "/communities/:slug/edit",
    "/communities/:slug/settings",
    "/communities/:slug/join-requests",
    "/organizations",
    "/organizations/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
