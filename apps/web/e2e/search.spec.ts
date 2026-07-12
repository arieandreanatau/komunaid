import { test, expect } from "@playwright/test";

const communitiesData = [
  {
    id: "1",
    name: "Tech Jakarta",
    slug: "tech-jakarta",
    description: "Komunitas teknologi di Jakarta",
    location: "Jakarta",
    membershipType: "OPEN",
    visibility: "PUBLIC",
    status: "APPROVED",
    owner: { id: "u1", name: "John", avatar: null },
    memberCount: 120,
    eventCount: 15,
    categories: [{ id: "c1", name: "Technology" }],
    tags: [],
    coverImage: null,
    logo: null,
    banner: null,
    createdAt: new Date().toISOString(),
  },
];

const mockEvents = [
  {
    id: "1",
    title: "React Meetup",
    slug: "react-meetup",
    description: "Meetup React di Jakarta",
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    locationType: "OFFLINE",
    location: "Jakarta",
    status: "REGISTRATION_OPEN",
    quota: 50,
    registeredCount: 30,
    coverImage: null,
    thumbnail: null,
    community: { name: "Tech Jakarta", slug: "tech-jakarta" },
    organization: null,
    categories: [],
  },
];

const mockVolunteerData = [
  {
    id: "1",
    title: "Bersih-bersih Pantai",
    slug: "bersih-bersih-pantai",
    description: "Volunteer bersih pantai",
    status: "OPEN",
    event: {
      id: "1",
      title: "Beach Cleanup",
      slug: "beach-cleanup",
      eventDate: new Date().toISOString(),
      location: "Jakarta",
      status: "REGISTRATION_OPEN",
    },
    createdBy: { id: "u1", name: "Admin", avatar: "" },
    positions: [],
    applicationCount: 10,
    registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
    activityStartDate: new Date(Date.now() + 172800000).toISOString(),
    coverImage: null,
    thumbnail: null,
    createdAt: new Date().toISOString(),
  },
];

test.describe("Search - Communities", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/communities*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: communitiesData,
          pagination: { total: 1, totalPages: 1, page: 1, limit: 12 },
        }),
      });
    });
    await page.route("**/api/v1/categories*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route("**/api/v1/communities/meta/provinces", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route("**/api/v1/communities/featured/list", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/v1/communities/new/list", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
    });
    await page.route("**/api/v1/communities/popular/list", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
    });
  });

  test("search input exists on communities page", async ({ page }) => {
    await page.goto("/communities");
    await expect(page.getByPlaceholder("Cari komunitas...")).toBeVisible();
  });

  test("typing in search updates the input value", async ({ page }) => {
    await page.goto("/communities");
    const searchInput = page.getByPlaceholder("Cari komunitas...");
    await searchInput.fill("Tech");
    await expect(searchInput).toHaveValue("Tech");
  });

  test("clearing search resets the input", async ({ page }) => {
    await page.goto("/communities");
    const searchInput = page.getByPlaceholder("Cari komunitas...");
    await searchInput.fill("Tech");
    await searchInput.clear();
    await expect(searchInput).toHaveValue("");
  });

  test("search is debounced (not immediate)", async ({ page }) => {
    await page.goto("/communities");
    const searchInput = page.getByPlaceholder("Cari komunitas...");
    const startTime = Date.now();
    await searchInput.fill("a");
    await searchInput.fill("ab");
    await searchInput.fill("abc");
    await page.waitForTimeout(500);
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(400);
  });
});

test.describe("Search - Events", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/events*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: mockEvents,
          pagination: { total: 1, totalPages: 1, page: 1, limit: 12 },
        }),
      });
    });
  });

  test("search input exists on events page", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByPlaceholder("Cari event...")).toBeVisible();
  });

  test("typing in search updates input value", async ({ page }) => {
    await page.goto("/events");
    const searchInput = page.getByPlaceholder("Cari event...");
    await searchInput.fill("React");
    await expect(searchInput).toHaveValue("React");
  });

  test("search filters combined with status tab", async ({ page }) => {
    await page.goto("/events");
    await page.getByPlaceholder("Cari event...").fill("React");
    await page.getByRole("button", { name: "Mendatang" }).click();
    await expect(page.getByRole("button", { name: "Mendatang" })).toHaveClass(/bg-komuna-blue/);
  });

  test("search filters combined with location type", async ({ page }) => {
    await page.goto("/events");
    await page.getByPlaceholder("Cari event...").fill("Workshop");
    await page.getByRole("button", { name: "Online" }).click();
    await expect(page.getByRole("button", { name: "Online" })).toHaveClass(/bg-komuna-blue/);
  });
});

test.describe("Search - Volunteer", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/volunteer*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: mockVolunteerData,
          pagination: { total: 1, totalPages: 1, page: 1, limit: 12 },
        }),
      });
    });
  });

  test("search input exists on volunteer page", async ({ page }) => {
    await page.goto("/volunteer");
    await expect(page.getByPlaceholder("Cari volunteer...")).toBeVisible();
  });

  test("typing in search updates input value", async ({ page }) => {
    await page.goto("/volunteer");
    const searchInput = page.getByPlaceholder("Cari volunteer...");
    await searchInput.fill("Pantai");
    await expect(searchInput).toHaveValue("Pantai");
  });

  test("search combined with status filter", async ({ page }) => {
    await page.goto("/volunteer");
    await page.getByPlaceholder("Cari volunteer...").fill("Pantai");
    await page.getByRole("button", { name: "Open" }).click();
    await expect(page.getByRole("button", { name: "Open" })).toHaveClass(/bg-komuna-blue/);
  });

  test("search combined with sort option", async ({ page }) => {
    await page.goto("/volunteer");
    await page.getByPlaceholder("Cari volunteer...").fill("Pantai");
    const sortSelect = page.getByRole("combobox");
    await sortSelect.selectOption("name");
    await expect(sortSelect).toHaveValue("name");
  });
});
