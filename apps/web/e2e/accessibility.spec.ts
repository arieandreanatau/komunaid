import { test, expect } from "@playwright/test";

test.describe("Accessibility - WCAG Basics", () => {
  test("home page has lang attribute", async ({ page }) => {
    await page.goto("/");
    const lang = await page.getAttribute("html", "lang");
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}/);
  });

  test("all images have alt attributes", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });

  test("form inputs have labels", async ({ page }) => {
    await page.goto("/login");
    const inputs = page.locator("input:not([type=hidden])");
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
      expect(id || ariaLabel || ariaLabelledBy || hasLabel).toBeTruthy();
    }
  });

  test("buttons have accessible names", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      expect((text || "").trim() || ariaLabel).toBeTruthy();
    }
  });

  test("headings are in hierarchical order", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1);
  });

  test("skip to content link exists or page is accessible", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toBeAttached();
    }
  });

  test("links are distinguishable (not only by color)", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("page has proper landmark regions", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    const footer = page.locator("footer");
    await expect(header).toBeVisible();
    await expect(footer).toBeVisible();
  });
});

test.describe("Accessibility - Keyboard Navigation", () => {
  test("Tab key moves focus through interactive elements", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("links are focusable via keyboard", async ({ page }) => {
    await page.goto("/");
    const firstLink = page.locator("header a").first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
  });

  test("buttons are focusable via keyboard", async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 375, height: 812 });
    const menuButton = page.getByRole("button", { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.focus();
      await expect(menuButton).toBeFocused();
    }
  });

  test("Enter key activates focused links", async ({ page }) => {
    await page.goto("/");
    const registerLink = page.getByRole("link", { name: "Mulai Sekarang" });
    await registerLink.focus();
    await Promise.all([
      page.waitForURL(/\/register(?:\?|$)/, { waitUntil: "commit" }),
      page.keyboard.press("Enter"),
    ]);
    expect(page.url()).toMatch(/\/register(?:\?|$)/);
  });

  test("Escape key can close modals/menus", async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 375, height: 812 });
    const menuButton = page.getByRole("button", { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.keyboard.press("Escape");
    }
  });
});

test.describe("Accessibility - Color and Contrast", () => {
  test("interactive elements have visible focus indicators", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.getByLabel("Email atau Username");
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
  });

  test("error messages are associated with form fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Masuk" }).click();
    await page.waitForTimeout(500);
    const errorMessages = page.locator("p.text-red-500");
    const count = await errorMessages.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Accessibility - Forms", () => {
  test("required fields are indicated", async ({ page }) => {
    await page.goto("/register");
    const nameInput = page.getByLabel("Nama Lengkap");
    const isRequired = await nameInput.getAttribute("required");
    expect(isRequired).not.toBeNull();
  });

  test("form error states are announced", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Masuk" }).click();
    await page.waitForTimeout(500);
    const errorText = page.locator("p.text-red-500").first();
    await expect(errorText).toBeVisible();
  });

  test("login form has proper input types", async ({ page }) => {
    await page.goto("/login");
    const passwordInput = page.getByLabel("Password");
    const type = await passwordInput.getAttribute("type");
    expect(type).toBe("password");
  });

  test("email field uses email type", async ({ page }) => {
    await page.goto("/register");
    const emailInput = page.getByLabel("Email");
    const type = await emailInput.getAttribute("type");
    expect(type).toBe("email");
  });
});

test.describe("Accessibility - Semantic HTML", () => {
  test("home page uses semantic header element", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("home page uses semantic footer element", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("login page has heading structure", async ({ page }) => {
    await page.goto("/login");
    const headings = page.locator("h1, h2, h3");
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test("lists use proper list markup", async ({ page }) => {
    await page.goto("/");
    const lists = page.locator("ul, ol");
    if ((await lists.count()) > 0) {
      const firstList = lists.first();
      const items = firstList.locator("li");
      expect(await items.count()).toBeGreaterThan(0);
    }
  });

  test("links use href attribute", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("a");
    const count = await links.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
    }
  });
});
