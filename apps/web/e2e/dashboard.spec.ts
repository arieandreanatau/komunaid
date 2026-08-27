import { test, expect } from "@playwright/test";
import { mockLoginSuccess, mockProfile } from "./helpers/api";
import { SignJWT } from "jose";

async function setAuthCookie(page: import("@playwright/test").Page) {
  const token = await new SignJWT({
    email: "test@example.com",
    name: "Test User",
    type: "access",
    roles: ["MEMBER"],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("user1")
    .setIssuedAt()
    .setExpirationTime("1h")
     .sign(new TextEncoder().encode("test-playwright-jwt-secret-32-characters-minimum"));
  return page.context().addCookies([
    { name: "token", value: token, domain: "localhost", path: "/" },
  ]);
}

test.describe("Dashboard - Access Control", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("authenticated user can access dashboard", async ({ page }) => {
    await setAuthCookie(page);
    await mockLoginSuccess(page);
    await mockProfile(page);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe("Dashboard - Profile", () => {
  test.beforeEach(async ({ page }) => {
    await setAuthCookie(page);
    await mockLoginSuccess(page);
    await mockProfile(page, {
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      roles: ["USER"],
      communities: [],
      events: [],
      unreadNotifications: 3,
    });
    await page.goto("/dashboard");
  });

  test("displays welcome message with user name", async ({ page }) => {
    await expect(page.getByText("Selamat datang, Test User!")).toBeVisible();
  });

  test("displays profile summary", async ({ page }) => {
    await expect(page.getByText("Profile Summary")).toBeVisible();
    await expect(page.getByText("@testuser")).toBeVisible();
    await expect(page.getByText("test@example.com")).toBeVisible();
  });

  test("displays quick stats cards", async ({ page }) => {
    await expect(page.getByText("Komunitas Diikuti")).toBeVisible();
    await expect(page.getByText("Event Terdaftar")).toBeVisible();
    await expect(page.getByText("Event Tersimpan")).toBeVisible();
  });

  test("shows edit profile link", async ({ page }) => {
    const editLink = page.getByRole("link", { name: "Edit Profile" });
    await expect(editLink).toBeVisible();
    await expect(editLink).toHaveAttribute("href", "/dashboard/profile");
  });

  test("shows create community and explore links", async ({ page }) => {
    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: "Buat Komunitas", exact: true })).toBeVisible();
    await expect(main.getByRole("link", { name: "Jelajahi Komunitas", exact: true })).toBeVisible();
  });
});

test.describe("Dashboard - Notifications", () => {
  test("dashboard notifications page requires auth", async ({ page }) => {
    await page.goto("/dashboard/notifications");
    await expect(page).toHaveURL(/login/);
  });

  test("authenticated user can access notifications", async ({ page }) => {
    await setAuthCookie(page);
    await mockLoginSuccess(page);
    await mockProfile(page);
    await page.route("**/api/v1/users/notifications*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], pagination: { total: 0, totalPages: 0 } }),
      });
    });
    await page.goto("/dashboard/notifications");
    await expect(page).toHaveURL(/dashboard\/notifications/);
  });
});

test.describe("Dashboard - Settings", () => {
  test("settings page requires authentication", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/login/);
  });

  test("authenticated user can access settings", async ({ page }) => {
    await setAuthCookie(page);
    await mockLoginSuccess(page);
    await mockProfile(page);
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/dashboard\/settings/);
  });
});

test.describe("Dashboard - Responsive", () => {
  test("dashboard is usable on mobile viewport", async ({ page }) => {
    await setAuthCookie(page);
    await mockLoginSuccess(page);
    await mockProfile(page, {
      name: "Mobile User",
      username: "mobileuser",
      email: "mobile@example.com",
      roles: ["USER"],
      communities: [],
      events: [],
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");
    await expect(page.getByText("Selamat datang, Mobile User!")).toBeVisible();
  });

  test("dashboard is usable on tablet viewport", async ({ page }) => {
    await setAuthCookie(page);
    await mockLoginSuccess(page);
    await mockProfile(page, {
      name: "Tablet User",
      username: "tabletuser",
      email: "tablet@example.com",
      roles: ["USER"],
      communities: [],
      events: [],
    });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard");
    await expect(page.getByText("Selamat datang, Tablet User!")).toBeVisible();
  });
});

test.describe("Dashboard - Komunitas Saya", () => {
  test.beforeEach(async ({ page }) => {
    await setAuthCookie(page);
    await mockLoginSuccess(page);
    await mockProfile(page, {
      communities: [
        { id: "created-1", name: "Komunitas Buatan", slug: "komunitas-buatan", logo: null, role: "OWNER", status: "APPROVED" },
        { id: "followed-1", name: "Komunitas Aktif", slug: "komunitas-aktif", logo: null, role: "MEMBER", status: "APPROVED" },
      ],
      createdCommunities: [
        { id: "created-1", name: "Komunitas Buatan", slug: "komunitas-buatan", logo: null, role: "OWNER", status: "APPROVED" },
      ],
      followedCommunities: [
        { id: "followed-1", name: "Komunitas Aktif", slug: "komunitas-aktif", logo: null, role: "MEMBER", status: "APPROVED" },
      ],
      pastCommunities: [
        { id: "past-1", name: "Komunitas Lama", slug: "komunitas-lama", logo: null, role: "MEMBER", status: "APPROVED", leftAt: "2026-07-01T00:00:00.000Z", leftReason: "REMOVED" },
      ],
    });
    await page.goto("/dashboard/communities");
  });

  test("separates created, followed, and past communities", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Dibuat oleh Saya" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Diikuti", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Pernah Diikuti" })).toBeVisible();
    await expect(page.getByText("Komunitas Buatan").first()).toBeVisible();

    await page.getByRole("tab", { name: "Diikuti", exact: true }).click();
    await expect(page.getByText("Komunitas Aktif").first()).toBeVisible();

    await page.getByRole("tab", { name: "Pernah Diikuti" }).click();
    await expect(page.getByText("Komunitas Lama").first()).toBeVisible();
    await expect(page.getByText("Pernah bergabung").first()).toBeVisible();
  });
});
