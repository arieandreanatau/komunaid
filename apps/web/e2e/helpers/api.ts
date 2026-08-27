import { type Page, type Route } from "@playwright/test";
import { SignJWT } from "jose";

const API_BASE = "**/api/v1/**";
const JWT_SECRET = new TextEncoder().encode("test-playwright-jwt-secret-32-characters-minimum");

export async function testAccessToken(userId: string, roles: string[] = ["USER"]) {
  return new SignJWT({
    email: "test@example.com",
    name: "Test User",
    type: "access",
    roles,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export async function mockCommunities(page: Page, data: unknown[] = []) {
  await page.route("**/api/v1/communities*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data,
        pagination: { total: data.length, totalPages: 1, page: 1, limit: 12 },
      }),
    });
  });
}

export async function mockEvents(page: Page, data: unknown[] = []) {
  // Public pages mount Header/AuthProvider, which requests auth/me on load.
  // Keep event-list E2E isolated from the local Hono API and its DB.
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unauthorized" }),
    });
  });
  await page.route("**/api/v1/events*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data,
        pagination: { total: data.length, totalPages: 1, page: 1, limit: 12 },
      }),
    });
  });
  // Route handlers execute newest-first in Playwright. Detail must override list.
  await page.route(/\/api\/v1\/events\/[^/?]+(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: data[0] || null }),
    });
  });
}

export async function mockVolunteer(page: Page, data: unknown[] = []) {
  await page.route("**/api/v1/volunteer*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data,
        pagination: { total: data.length, totalPages: 1, page: 1, limit: 12 },
      }),
    });
  });
}

export async function mockCategories(page: Page, data: unknown[] = []) {
  await page.route("**/api/v1/categories*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data }),
    });
  });
}

export async function mockLoginSuccess(page: Page, userData?: object, roles: string[] = ["USER"]) {
  const defaultUser = {
    id: "test-user-id",
    name: "Test User",
    username: "testuser",
    email: "test@example.com",
    roles,
    ...userData,
  };
  const token = await testAccessToken(defaultUser.id, roles);
  await page.route("**/api/v1/auth/login", async (route) => {
    await page.context().addCookies([{ name: "token", value: token, domain: "localhost", path: "/" }]);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: defaultUser,
          token,
        },
      }),
    });
  });
  await page.route("**/api/v1/auth/me", async (route) => {
    const hasToken = (await page.context().cookies()).some((cookie) => cookie.name === "token" && cookie.value.length > 0);
    if (!hasToken) {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({}) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { user: defaultUser } }),
    });
  });
}

export async function mockLoginFailure(page: Page, message = "Login gagal") {
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message }),
    });
  });
}

export async function mockRegisterSuccess(page: Page, userData?: object, roles: string[] = ["USER"]) {
  const defaultUser = {
    id: "new-user-id",
    name: "New User",
    username: "newuser",
    email: "new@example.com",
    roles,
    ...userData,
  };
  const token = await testAccessToken(defaultUser.id, roles);
  await page.context().addCookies([{ name: "token", value: token, domain: "localhost", path: "/" }]);

  await page.route("**/api/v1/auth/register", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: defaultUser,
          token,
        },
      }),
    });
  });
}

export async function mockRegisterFailure(page: Page, message = "Registrasi gagal") {
  await page.route("**/api/v1/auth/register", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ message }),
    });
  });
}

export async function mockForgotPasswordSuccess(page: Page) {
  await page.route("**/api/v1/auth/forgot-password", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Email reset password telah dikirim" }),
    });
  });
}

export async function mockProfile(page: Page, profileData?: object) {
  const defaultProfile = {
    id: "test-user-id",
    name: "Test User",
    username: "testuser",
    email: "test@example.com",
    roles: ["USER"],
    communities: [],
    events: [],
    unreadNotifications: 0,
    ...profileData,
  };

  await page.route("**/api/v1/users/profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { user: defaultProfile } }),
    });
  });
}

export async function mockApiError(page: Page, endpoint: string, status = 500) {
  await page.route(`**/api/v1/${endpoint}*`, async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ message: "Internal Server Error" }),
    });
  });
}

export async function interceptAndAbortAll(page: Page, pattern = API_BASE) {
  await page.route(pattern, async (route) => {
    await route.abort("connectionrefused");
  });
}
