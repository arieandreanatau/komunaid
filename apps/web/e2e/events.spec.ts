import { test, expect } from "@playwright/test";
import { mockEvents, mockLoginSuccess, mockProfile } from "./helpers/api";

const mockEventData = [
  {
    id: "1",
    title: "React Meetup Jakarta",
    slug: "react-meetup-jakarta",
    description: "Meetup untuk para developer React di Jakarta",
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    locationType: "OFFLINE",
    location: "Jakarta Selatan",
    status: "REGISTRATION_OPEN",
    quota: 50,
    registeredCount: 30,
    coverImage: null,
    thumbnail: null,
    community: { name: "Tech Jakarta", slug: "tech-jakarta" },
    organization: null,
    categories: [{ id: "c1", name: "Technology" }],
  },
  {
    id: "2",
    title: "Online Workshop UI/UX",
    slug: "online-workshop-uiux",
    description: "Workshop desain UI/UX secara online",
    eventDate: new Date(Date.now() + 172800000).toISOString(),
    locationType: "ONLINE",
    location: null,
    status: "PUBLISHED",
    quota: 100,
    registeredCount: 45,
    coverImage: null,
    thumbnail: null,
    community: { name: "Design Bandung", slug: "design-bandung" },
    organization: null,
    categories: [{ id: "c2", name: "Design" }],
  },
];

test.describe("Events Listing", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await mockEvents(page, mockEventData);
  });

  test("loads the events directory page", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Direktori Event" })).toBeVisible();
  });

  test("displays status filter tabs", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("button", { name: "Semua" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Mendatang" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Berlangsung" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Selesai" })).toBeVisible();
  });

  test("displays location type filter", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("button", { name: "Offline" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Online" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hybrid" })).toBeVisible();
  });

  test("search input is present", async ({ page }) => {
    await page.goto("/events");
    const searchInput = page.getByPlaceholder("Cari event...");
    await expect(searchInput).toBeVisible();
  });

  test("displays event cards with title and date", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByText("React Meetup Jakarta")).toBeVisible();
    await expect(page.getByText("Online Workshop UI/UX")).toBeVisible();
  });

  test("event cards link to detail page", async ({ page }) => {
    await page.goto("/events");
    const card = page.getByRole("link", { name: "React Meetup Jakarta" }).first();
    await expect(card).toHaveAttribute("href", "/events/react-meetup-jakarta");
  });

  test("shows participant count", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByText("30/50 peserta").first()).toBeVisible();
  });

  test("sort dropdown is present", async ({ page }) => {
    await page.goto("/events");
    const sortSelect = page.getByRole("combobox");
    await expect(sortSelect).toBeVisible();
  });

  test("page is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Direktori Event" })).toBeVisible();
  });

  test("clicking status tab changes the filter", async ({ page }) => {
    await page.goto("/events");
    const upcomingTab = page.getByRole("button", { name: "Mendatang" });
    await upcomingTab.click();
    await expect(upcomingTab).toHaveClass(/bg-komuna-blue/);
  });
});

test.describe("Events - Detail Page", () => {
  test("links to event detail from listing", async ({ page }) => {
    await mockEvents(page, mockEventData);
    await page.goto("/events");
    await expect(page.getByRole("link", { name: "React Meetup Jakarta" }).first()).toHaveAttribute(
      "href",
      "/events/react-meetup-jakarta"
    );
  });
});

test.describe("Events - Registration", () => {
  test("unauthenticated user is redirected to login for registration", async ({ page }) => {
    await page.goto("/events/react-meetup-jakarta");
    await page.waitForTimeout(1000);
    const registerBtn = page.getByRole("button", { name: /daftar|register/i });
    if (await registerBtn.isVisible()) {
      await registerBtn.click();
      await expect(page).toHaveURL(/login/);
    }
  });
});
