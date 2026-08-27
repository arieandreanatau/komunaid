import { test, expect } from "@playwright/test";

test.describe("Admin - Login", () => {
  test("loads admin login page", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByText("Admin Panel").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Masuk ke Admin Panel" })).toBeVisible();
  });

  test("displays login form with all fields", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByLabel("Email atau Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Masuk ke Admin Panel" })).toBeVisible();
  });

  test("shows link to regular login", async ({ page }) => {
    await page.goto("/admin/login");
    const regularLogin = page.getByRole("link", { name: "Login biasa" });
    await expect(regularLogin).toBeVisible();
    await expect(regularLogin).toHaveAttribute("href", "/login");
  });

  test("shows forgot password link", async ({ page }) => {
    await page.goto("/admin/login");
    const forgotLink = page.getByRole("link", { name: "Lupa password?" });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  test("validates required fields", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: "Masuk ke Admin Panel" }).click();
    await expect(page.locator("p.text-red-500").first()).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Email atau password salah" }),
      });
    });
    await page.goto("/admin/login");
    await page.getByLabel("Email atau Username").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Masuk ke Admin Panel" }).click();
    await expect(page.getByText("Email atau password salah")).toBeVisible();
  });

  test("shows error for non-admin user", async ({ page }) => {
    await page.route("**/api/v1/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            user: {
              id: "user1",
              name: "Regular User",
              roles: ["USER"],
            },
            token: "jwt-token",
          },
        }),
      });
    });
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({ status: 401, contentType: "application/json", body: "{}" });
    });

    await page.goto("/admin/login");
    await page.getByLabel("Email atau Username").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Masuk ke Admin Panel" }).click();
    await expect(page.getByText("Akun Anda tidak memiliki akses")).toBeVisible();
  });

  test("page has KomunaID branding", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByText("KomunaID Administration Panel")).toBeVisible();
  });

  test("admin login page is responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "Masuk ke Admin Panel" })).toBeVisible();
  });

  test("admin access page redirects correctly", async ({ page }) => {
    await page.goto("/admin-access");
    await expect(page).toHaveURL(/admin-access/);
  });
});

test.describe("Admin - Dashboard", () => {
  test("unauthenticated admin redirected to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/admin\/login/);
  });

  test("admin routes require authentication", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/admin\/login/);
  });

  test("admin community moderation requires auth", async ({ page }) => {
    await page.goto("/admin/communities");
    await expect(page).toHaveURL(/admin\/login/);
  });

  test("admin event moderation requires auth", async ({ page }) => {
    await page.goto("/admin/events");
    await expect(page).toHaveURL(/admin\/login/);
  });

  test("admin settings requires auth", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/admin\/login/);
  });
});
