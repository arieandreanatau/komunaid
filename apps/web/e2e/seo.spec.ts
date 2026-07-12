import { test, expect } from "@playwright/test";

test.describe("SEO - Meta Tags", () => {
  test("home page has title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toContain("KomunaID");
  });

  test("home page has meta description", async ({ page }) => {
    await page.goto("/");
    const description = await page.getAttribute('meta[name="description"]', "content");
    expect(description).toBeTruthy();
    expect(description).toContain("komunitas");
  });

  test("home page has canonical URL", async ({ page }) => {
    await page.goto("/");
    const canonical = await page.getAttribute('link[rel="canonical"]', "href");
    expect(canonical).toBeTruthy();
  });

  test("home page has viewport meta", async ({ page }) => {
    await page.goto("/");
    const viewport = await page.getAttribute('meta[name="viewport"]', "content");
    expect(viewport).toBeTruthy();
  });

  test("home page has robots meta", async ({ page }) => {
    await page.goto("/");
    const robots = await page.getAttribute('meta[name="robots"]', "content");
    expect(robots).toBeTruthy();
  });

  test("home page has lang attribute on html", async ({ page }) => {
    await page.goto("/");
    const lang = await page.getAttribute("html", "lang");
    expect(lang).toBe("id");
  });

  test("communities page has title", async ({ page }) => {
    await page.route("**/api/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], pagination: { total: 0, totalPages: 0 } }),
      });
    });
    await page.goto("/communities");
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("events page has title", async ({ page }) => {
    await page.route("**/api/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], pagination: { total: 0, totalPages: 0 } }),
      });
    });
    await page.goto("/events");
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});

test.describe("SEO - OpenGraph", () => {
  test("home page has og:title", async ({ page }) => {
    await page.goto("/");
    const ogTitle = await page.getAttribute('meta[property="og:title"]', "content");
    expect(ogTitle).toBeTruthy();
  });

  test("home page has og:description", async ({ page }) => {
    await page.goto("/");
    const ogDesc = await page.getAttribute('meta[property="og:description"]', "content");
    expect(ogDesc).toBeTruthy();
  });

  test("home page has og:type", async ({ page }) => {
    await page.goto("/");
    const ogType = await page.getAttribute('meta[property="og:type"]', "content");
    expect(ogType).toBe("website");
  });

  test("home page has og:url", async ({ page }) => {
    await page.goto("/");
    const ogUrl = await page.getAttribute('meta[property="og:url"]', "content");
    expect(ogUrl).toBeTruthy();
  });

  test("home page has og:site_name", async ({ page }) => {
    await page.goto("/");
    const siteName = await page.getAttribute('meta[property="og:site_name"]', "content");
    expect(siteName).toBe("KomunaID");
  });

  test("home page has og:locale", async ({ page }) => {
    await page.goto("/");
    const locale = await page.getAttribute('meta[property="og:locale"]', "content");
    expect(locale).toBe("id_ID");
  });

  test("home page has og:image", async ({ page }) => {
    await page.goto("/");
    const ogImage = await page.getAttribute('meta[property="og:image"]', "content");
    expect(ogImage).toBeTruthy();
  });
});

test.describe("SEO - Twitter Card", () => {
  test("home page has twitter:card", async ({ page }) => {
    await page.goto("/");
    const card = await page.getAttribute('meta[name="twitter:card"]', "content");
    expect(card).toBe("summary_large_image");
  });

  test("home page has twitter:title", async ({ page }) => {
    await page.goto("/");
    const title = await page.getAttribute('meta[name="twitter:title"]', "content");
    expect(title).toBeTruthy();
  });

  test("home page has twitter:description", async ({ page }) => {
    await page.goto("/");
    const desc = await page.getAttribute('meta[name="twitter:description"]', "content");
    expect(desc).toBeTruthy();
  });
});

test.describe("SEO - Structured Data (JSON-LD)", () => {
  test("home page has JSON-LD script tags", async ({ page }) => {
    await page.goto("/");
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThan(0);
  });

  test("JSON-LD contains valid JSON", async ({ page }) => {
    await page.goto("/");
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      expect(() => JSON.parse(content!)).not.toThrow();
    }
  });

  test("JSON-LD has @type", async ({ page }) => {
    await page.goto("/");
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    let hasType = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      const data = JSON.parse(content!);
      if (data["@type"]) hasType = true;
    }
    expect(hasType).toBe(true);
  });
});

test.describe("SEO - Additional Meta", () => {
  test("home page has favicon", async ({ page }) => {
    await page.goto("/");
    const favicon = await page.getAttribute('link[rel="icon"]', "href");
    expect(favicon).toBeTruthy();
  });

  test("home page has apple-touch-icon", async ({ page }) => {
    await page.goto("/");
    const appleIcon = await page.getAttribute('link[rel="apple-touch-icon"]', "href");
    expect(appleIcon).toBeTruthy();
  });

  test("home page has theme-color meta", async ({ page }) => {
    await page.goto("/");
    const themeColor = await page.getAttribute('meta[name="theme-color"]', "content");
    expect(themeColor).toBeTruthy();
  });

  test("home page has manifest link", async ({ page }) => {
    await page.goto("/");
    const manifest = await page.getAttribute('link[rel="manifest"]', "href");
    expect(manifest).toBeTruthy();
  });

  test("home page has keyword meta", async ({ page }) => {
    await page.goto("/");
    const keywords = await page.getAttribute('meta[name="keywords"]', "content");
    expect(keywords).toBeTruthy();
    expect(keywords).toContain("komunitas");
  });
});
