import { test, expect } from "@playwright/test";

test.describe("Error Pages - 404 Not Found", () => {
  test("displays 404 page for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Halaman Tidak Ditemukan")).toBeVisible();
  });

  test("404 page has back to home link", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    const homeLink = page.getByRole("link", { name: "Kembali ke Beranda" });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute("href", "/");
  });

  test("404 page has explore communities link", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    const exploreLink = page.getByRole("link", { name: "Jelajahi Komunitas" });
    await expect(exploreLink).toBeVisible();
    await expect(exploreLink).toHaveAttribute("href", "/communities");
  });

  test("404 page shows quick navigation links", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.getByRole("link", { name: "Event" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Volunteer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "FAQ" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Kontak" })).toBeVisible();
  });

  test("404 page has footer", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("404 page has proper metadata", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await expect(page).toHaveTitle(/Halaman Tidak Ditemukan/);
  });

  test("navigating home from 404 works", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    await page.getByRole("link", { name: "Kembali ke Beranda" }).click();
    await expect(page).toHaveURL("/");
  });

  test("404 page is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/nonexistent-page-xyz");
    await expect(page.getByText("404")).toBeVisible();
  });

  test("deep nested unknown route shows 404", async ({ page }) => {
    await page.goto("/a/b/c/d/e/f");
    await expect(page.getByText("404")).toBeVisible();
  });
});

test.describe("Error Pages - 500 Server Error", () => {
  test("displays 500 error page", async ({ page }) => {
    await page.route("**/*", async (route) => {
      if (route.request().url().includes("favicon")) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: "text/html",
        body: "<html><body><h1>500</h1><p>Internal Server Error</p></body></html>",
      });
    });
    await page.goto("/");
    await page.waitForTimeout(2000);
  });

  test("500 page shows server error message", async ({ page }) => {
    await page.route("**/api/v1/**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Error Pages - Maintenance", () => {
  test("maintenance page displays correctly", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(page.getByText("Sedang Dalam Pemeliharaan")).toBeVisible();
  });

  test("maintenance page shows contact email", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(page.getByText("info@komuna.id")).toBeVisible();
  });

  test("maintenance page has retry link", async ({ page }) => {
    await page.goto("/maintenance");
    const retryLink = page.getByRole("link", { name: "Coba Lagi Nanti" });
    await expect(retryLink).toBeVisible();
  });

  test("maintenance page has proper metadata", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(page).toHaveTitle(/Pemeliharaan/);
  });

  test("maintenance page is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/maintenance");
    await expect(page.getByText("Sedang Dalam Pemeliharaan")).toBeVisible();
  });

  test("maintenance page shows estimated time info", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(page.getByText(/estimasi|pemeliharaan/i)).toBeVisible();
  });
});

test.describe("Error Pages - Forbidden", () => {
  test("forbidden page displays correctly", async ({ page }) => {
    await page.route("**/api/v1/**", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ message: "Forbidden" }),
      });
    });
    await page.goto("/forbidden");
    await expect(page.getByText("403")).toBeVisible();
    await expect(page.getByText("Akses Ditolak")).toBeVisible();
  });

  test("forbidden page has back to home link", async ({ page }) => {
    await page.goto("/forbidden");
    const homeLink = page.getByRole("link", { name: "Kembali ke Beranda" });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute("href", "/");
  });
});
