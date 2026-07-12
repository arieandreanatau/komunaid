import { test, expect } from "@playwright/test";
import {
  mockCommunities,
  mockCategories,
  mockLoginSuccess,
  mockProfile,
} from "./helpers/api";

const mockCommunityData = [
  {
    id: "1",
    name: "Tech Jakarta",
    slug: "tech-jakarta",
    description: "Komunitas teknologi di Jakarta",
    location: "Jakarta",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    membershipType: "OPEN",
    visibility: "PUBLIC",
    status: "APPROVED",
    owner: { id: "u1", name: "John Doe", avatar: null },
    memberCount: 120,
    eventCount: 15,
    categories: [{ id: "c1", name: "Technology" }],
    tags: [{ id: "t1", tag: "javascript" }],
    coverImage: null,
    logo: null,
    banner: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Design Bandung",
    slug: "design-bandung",
    description: "Komunitas desain di Bandung",
    location: "Bandung",
    province: "Jawa Barat",
    city: "Bandung",
    membershipType: "RESTRICTED",
    visibility: "PUBLIC",
    status: "APPROVED",
    owner: { id: "u2", name: "Jane Doe", avatar: null },
    memberCount: 85,
    eventCount: 8,
    categories: [{ id: "c2", name: "Design" }],
    tags: [{ id: "t2", tag: "ui-ux" }],
    coverImage: null,
    logo: null,
    banner: null,
    createdAt: new Date().toISOString(),
  },
];

test.describe("Communities Listing", () => {
  test.beforeEach(async ({ page }) => {
    await mockCommunities(page, mockCommunityData);
    await mockCategories(page, [
      { id: "c1", name: "Technology" },
      { id: "c2", name: "Design" },
    ]);
    await page.route("**/api/v1/communities/meta/provinces", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: ["DKI Jakarta", "Jawa Barat"] }),
      });
    });
    await page.route("**/api/v1/communities/featured/list", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route("**/api/v1/communities/new/list", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route("**/api/v1/communities/popular/list", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
  });

  test("loads the communities directory page", async ({ page }) => {
    await page.goto("/communities");
    await expect(page.getByRole("heading", { name: "Direktori Komunitas" })).toBeVisible();
  });

  test("displays section tabs", async ({ page }) => {
    await page.goto("/communities");
    await expect(page.getByRole("button", { name: "Jelajahi" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Unggulan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Terbaru" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Populer" })).toBeVisible();
  });

  test("displays community cards", async ({ page }) => {
    await page.goto("/communities");
    await expect(page.getByText("Tech Jakarta")).toBeVisible();
    await expect(page.getByText("Design Bandung")).toBeVisible();
  });

  test("search input filters communities", async ({ page }) => {
    await page.goto("/communities");
    const searchInput = page.getByPlaceholder("Cari komunitas...");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Tech");
    await expect(searchInput).toHaveValue("Tech");
  });

  test("membership filter buttons are visible", async ({ page }) => {
    await page.goto("/communities");
    await expect(page.getByRole("button", { name: "Semua" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Terbuka" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Terbatas" })).toBeVisible();
  });

  test("category filter dropdown is present", async ({ page }) => {
    await page.goto("/communities");
    const categorySelect = page.locator("select").first();
    await expect(categorySelect).toBeVisible();
  });

  test("sort dropdown is present", async ({ page }) => {
    await page.goto("/communities");
    const sortSelect = page.getByRole("combobox").last();
    await expect(sortSelect).toBeVisible();
  });

  test("community cards link to detail page", async ({ page }) => {
    await page.goto("/communities");
    const card = page.getByRole("link", { name: "Tech Jakarta" }).first();
    await expect(card).toHaveAttribute("href", "/communities/tech-jakarta");
  });

  test("displays member and event count", async ({ page }) => {
    await page.goto("/communities");
    await expect(page.getByText("120 anggota").first()).toBeVisible();
    await expect(page.getByText("15 event").first()).toBeVisible();
  });

  test("page is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/communities");
    await expect(page.getByRole("heading", { name: "Direktori Komunitas" })).toBeVisible();
  });
});

test.describe("Communities - Create (Auth Required)", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/communities/create");
    await expect(page).toHaveURL(/login/);
  });

  test("authenticated user can access create page", async ({ page }) => {
    await mockLoginSuccess(page);
    await mockProfile(page);
    await page.route("**/api/v1/categories*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    const fakeToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      btoa(JSON.stringify({ sub: "user1", exp: Math.floor(Date.now() / 1000) + 3600 })) +
      ".fake";
    await page.context().addCookies([
      { name: "token", value: fakeToken, domain: "localhost", path: "/" },
    ]);

    await page.goto("/communities/create");
    await expect(page).toHaveURL(/communities\/create/);
  });
});
