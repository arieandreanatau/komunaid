import { test, expect } from "@playwright/test";
import {
  mockLoginSuccess,
  mockLoginFailure,
  mockRegisterSuccess,
  mockRegisterFailure,
  mockForgotPasswordSuccess,
} from "./helpers/api";

test.describe("Authentication - Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("displays login form with all fields", async ({ page }) => {
    await expect(page.getByLabel("Email atau Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
  });

  test("shows KomunaID logo and heading", async ({ page }) => {
    await expect(page.getByText("Masuk ke Akun")).toBeVisible();
    await expect(page.locator("a").filter({ hasText: "KomunaID" }).first()).toBeVisible();
  });

  test("shows link to register page", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: "Daftar sekarang" });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/register");
  });

  test("shows link to forgot password", async ({ page }) => {
    const forgotLink = page.getByRole("link", { name: "Lupa password?" });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  test("validates required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Masuk" }).click();
    const identifierError = page.locator("p.text-red-500").first();
    await expect(identifierError).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await mockLoginFailure(page, "Email atau password salah");
    await page.getByLabel("Email atau Username").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Masuk" }).click();
    await expect(page.getByText("Email atau password salah")).toBeVisible();
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await mockLoginSuccess(page);
    await page.getByLabel("Email atau Username").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Masuk" }).click();
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("redirect with redirect param", async ({ page }) => {
    await mockLoginSuccess(page);
    await page.goto("/login?redirect=/communities");
    await page.getByLabel("Email atau Username").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Masuk" }).click();
    await page.waitForURL("**/communities");
    await expect(page).toHaveURL(/communities/);
  });

  test("shows loading state while submitting", async ({ page }) => {
    let resolveLogin: (value: unknown) => void;
    await page.route("**/api/v1/auth/login", async (route) => {
      const response = await new Promise((resolve) => {
        resolveLogin = resolve;
      });
      await route.fulfill(response as any);
    });

    await page.getByLabel("Email atau Username").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Masuk" }).click();

    await expect(page.getByRole("button", { name: "Masuk..." })).toBeVisible();

    resolveLogin!({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { user: { id: "1", roles: ["USER"] }, token: "jwt" },
      }),
    });
  });
});

test.describe("Authentication - Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("displays register form with all fields", async ({ page }) => {
    await expect(page.getByLabel("Nama Lengkap")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Konfirmasi Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Daftar" })).toBeVisible();
  });

  test("shows terms and privacy checkbox", async ({ page }) => {
    const checkbox = page.getByLabel("terms");
    await expect(checkbox).toBeVisible();
    await expect(page.getByText("Syarat & Ketentuan")).toBeVisible();
    await expect(page.getByText("Kebijakan Privasi")).toBeVisible();
  });

  test("validates required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Daftar" }).click();
    await expect(page.locator("p.text-red-500").first()).toBeVisible();
  });

  test("successful registration redirects to dashboard", async ({ page }) => {
    await mockRegisterSuccess(page);
    await page.getByLabel("Nama Lengkap").fill("Test User");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Konfirmasi Password").fill("password123");
    await page.getByLabel("terms").check();
    await page.getByRole("button", { name: "Daftar" }).click();
    await expect(page.getByRole("heading", { name: "Pendaftaran Berhasil" })).toBeVisible();
    await expect(page.getByText("Memuat dashboard...")).toBeVisible();
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("shows error on registration failure", async ({ page }) => {
    await mockRegisterFailure(page, "Email sudah terdaftar");
    await page.getByLabel("Nama Lengkap").fill("Test User");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Email").fill("existing@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Konfirmasi Password").fill("password123");
    await page.getByLabel("terms").check();
    await page.getByRole("button", { name: "Daftar" }).click();
    await expect(page.getByText("Email sudah terdaftar")).toBeVisible();
  });

  test("shows link to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: "Masuk" });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });
});

test.describe("Authentication - Forgot Password", () => {
  test("displays forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByText("Lupa Password")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kirim Link Reset" })).toBeVisible();
  });

  test("validates email field", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByRole("button", { name: "Kirim Link Reset" }).click();
    await expect(page.locator("p.text-red-500").first()).toBeVisible();
  });

  test("shows success message after submission", async ({ page }) => {
    await mockForgotPasswordSuccess(page);
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByRole("button", { name: "Kirim Link Reset" }).click();
    await expect(page.getByText("Email reset password telah dikirim")).toBeVisible();
  });

  test("has link back to login", async ({ page }) => {
    await page.goto("/forgot-password");
    const backLink = page.getByRole("link", { name: "Kembali ke Login" });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/login");
  });
});

test.describe("Authentication - Protected Routes", () => {
  test("unauthenticated user redirected from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
    await expect(page).toHaveURL(/redirect=\/dashboard/);
  });

  test("unauthenticated user redirected from /communities/create", async ({ page }) => {
    await page.goto("/communities/create");
    await expect(page).toHaveURL(/login/);
    await expect(page).toHaveURL(/redirect=\/communities\/create/);
  });

  test("admin page redirects to /admin/login when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/admin\/login/);
  });
});
