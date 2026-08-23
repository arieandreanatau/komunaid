import { test, expect } from "@playwright/test";
import {
  mockCommunities,
  mockEvents,
  mockVolunteer,
} from "./helpers/api";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockCommunities(page, [
      {
        id: "1",
        name: "Tech Jakarta",
        slug: "tech-jakarta",
        description: "Komunitas teknologi Jakarta",
        location: "Jakarta",
        memberCount: 120,
        eventCount: 15,
        membershipType: "OPEN",
        owner: { id: "u1", name: "John", avatar: null },
        categories: [{ id: "c1", name: "Technology" }],
        tags: [],
        createdAt: new Date().toISOString(),
      },
    ]);
    await mockEvents(page, [
      {
        id: "1",
        title: "Meetup React",
        slug: "meetup-react",
        description: "React meetup event",
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
    ]);
    await mockVolunteer(page, [
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
          location: "Jakarta Selatan",
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
    ]);
  });

  test("loads the home page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("displays hero section with main heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("h1");
    await expect(heading).toContainText("Temukan komunitas");
    await expect(heading).toContainText("bertumbuh bersama");
  });

  test("displays tagline text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Temukan komunitas, kegiatan, dan kesempatan volunteer yang sesuai dengan minatmu.").first()).toBeVisible();
  });

  test("has CTA buttons in hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Mulai Sekarang" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Temukan Event" })).toBeVisible();
    await expect(page.getByRole("link", { name: "+ Buat Komunitas" }).first()).toBeVisible();
  });

  test("CTA 'Mulai Sekarang' links to register", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Mulai Sekarang" });
    await expect(cta).toHaveAttribute("href", "/register");
  });

  test("CTA counters follow links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Temukan Event" })).toHaveAttribute("href", "/events");
    await expect(page.getByRole("link", { name: "+ Buat Komunitas" }).first()).toHaveAttribute("href", "/communities/create");
  });

  test("displays discovery sections with final IA headings", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#komunitas h2")).toHaveText("Komunitas Populer");
    await expect(page.locator("#event h2")).toHaveText("Event Mendatang");
    await expect(page.locator("#volunteer h2")).toHaveText("Ambil Peran di Komunitas");
  });

  test("does not display fake statistics", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Statistik Kami")).toHaveCount(0);
  });

  test("displays volunteer discovery section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Ambil Peran di Komunitas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Temukan Volunteer" }).first()).toBeVisible();
  });

  test("displays minat, network, kolaborasi, and create-community sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Mulai dari Minatmu" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Terhubung Lebih Luas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Jelajahi Network" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kolaborasi Komunitas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat Kolaborasi" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Punya Komunitas?" })).toBeVisible();
    await expect(page.getByRole("link", { name: "+ Buat Komunitas" }).first()).toBeVisible();
  });

  test("footer provides platform access without exposing admin label", async ({ page }) => {
    await page.goto("/");
    const platformLink = page.getByRole("link", { name: "Masuk ke Platform" });
    await expect(platformLink).toBeVisible();
    await expect(platformLink).toHaveAttribute("href", "/admin/login");
    await expect(page.locator("footer").getByText("Login Admin")).toHaveCount(0);
  });

  test("section CTA links point to correct routes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Lihat Semua Komunitas" })).toHaveAttribute("href", "/communities");
    await expect(page.getByRole("link", { name: "Lihat Semua Event" })).toHaveAttribute("href", "/events");
    await expect(page.getByRole("link", { name: "Jelajahi Network" })).toHaveAttribute("href", "/network");
    await expect(page.getByRole("link", { name: "Lihat Kolaborasi" })).toHaveAttribute("href", "/kolaborasi");
    const spotlightCta = page.getByRole("link", { name: "Kenali Komunitas" });
    if (await spotlightCta.count()) {
      await expect(spotlightCta.first()).toHaveAttribute("href", /\/communities\//);
    }
  });

  test("has header and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("page is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const cta = page.getByRole("link", { name: "Jelajahi Komunitas" }).first();
    await expect(cta).toBeVisible();
  });

  test("page is responsive on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#komunitas h2")).toHaveText("Komunitas Populer");
  });
});
