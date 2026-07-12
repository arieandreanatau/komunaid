import { type Page, type Route } from "@playwright/test";

const API_BASE = "**/api/v1/**";

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

export async function mockLoginSuccess(page: Page, userData?: object) {
  const defaultUser = {
    id: "test-user-id",
    name: "Test User",
    username: "testuser",
    email: "test@example.com",
    roles: ["USER"],
    ...userData,
  };

  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: defaultUser,
          token: "mock.jwt.token",
        },
      }),
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

export async function mockRegisterSuccess(page: Page, userData?: object) {
  const defaultUser = {
    id: "new-user-id",
    name: "New User",
    username: "newuser",
    email: "new@example.com",
    roles: ["USER"],
    ...userData,
  };

  await page.route("**/api/v1/auth/register", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: defaultUser,
          token: "mock.jwt.token",
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
