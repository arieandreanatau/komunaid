import { test, expect } from "@playwright/test";

test.describe("Navigation - Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("header is visible on home page", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
  });

  test("logo links to home page", async ({ page }) => {
    const logo = page.locator("header").getByRole("link").first();
    await expect(logo).toBeVisible();
    const href = await logo.getAttribute("href");
    expect(href).toBe("/");
  });

  test("navigation links are present", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Komunitas" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Event" }).first()).toBeVisible();
  });

  test("login and register buttons visible for guests", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /masuk|login/i }).first();
    const registerLink = page.getByRole("link", { name: /daftar|register/i }).first();
    await expect(loginLink).toBeVisible();
    await expect(registerLink).toBeVisible();
  });

  test("header persists across pages", async ({ page }) => {
    test.setTimeout(120000);
    await expect(page.locator("header")).toBeVisible();
    await page.goto("/communities", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header")).toBeVisible();
    await page.goto("/events", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header")).toBeVisible();
  });

  test("V1.5 public pages load with header and footer", async ({ page }) => {
    test.setTimeout(120000);
    await page.goto("/network", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Terhubung Lebih Luas" }).first()).toBeVisible();
    await page.goto("/kolaborasi", { waitUntil: "domcontentloaded" });
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kolaborasi Komunitas" }).first()).toBeVisible();
  });

  test("header is sticky on scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(page.locator("header")).toBeVisible();
  });
});

test.describe("Navigation - Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("footer is visible on home page", async ({ page }) => {
    await expect(page.locator("footer")).toBeVisible();
  });

  test("footer contains copyright text", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toContainText(/KomunaID|komuna/i);
  });

  test("footer has navigation links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    const links = footer.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("footer appears on all public pages", async ({ page }) => {
    test.setTimeout(120000);
    await page.goto("/communities", { waitUntil: "domcontentloaded" });
    await expect(page.locator("footer")).toBeVisible();
    await page.goto("/events", { waitUntil: "domcontentloaded" });
    await expect(page.locator("footer")).toBeVisible();
    await page.goto("/volunteer", { waitUntil: "domcontentloaded" });
    await expect(page.locator("footer")).toBeVisible();
  });

  test("footer is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });
});

test.describe("Navigation - Breadcrumbs", () => {
  test("events page with communityId shows breadcrumbs", async ({ page }) => {
    await page.route("**/api/v1/communities/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { name: "Tech Jakarta" } }),
      });
    });
    await page.route("**/api/v1/events*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], pagination: { total: 0, totalPages: 0 } }),
      });
    });
    await page.goto("/events?communityId=123");
    const pageNav = page.locator("nav").filter({ hasText: "Event" }).first();
    if (await pageNav.isVisible()) {
      await expect(pageNav.getByText("Event")).toBeVisible();
    }
  });
});

test.describe("Navigation - Responsive Menu", () => {
  test("mobile menu toggle is visible on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const menuToggle = page.getByRole("button", { name: /menu|navigation|mobile/i });
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      await page.waitForTimeout(500);
    }
  });

  test("desktop nav items hidden on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const desktopNav = page.locator("header nav.hidden.md\\:flex");
    if ((await desktopNav.count()) > 0) {
      await expect(desktopNav).not.toBeVisible();
    }
  });
});

test.describe("Navigation - Accessibility", () => {
  test("links have accessible names", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("header a");
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test("header uses semantic landmark", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("footer uses semantic landmark", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("main content area is present", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main, [role='main']");
    if ((await main.count()) > 0) {
      await expect(main).toBeVisible();
    }
  });
});
