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
    await expect(heading).toContainText("Platform Komunitas");
    await expect(heading).toContainText("Digital Indonesia");
  });

  test("displays tagline text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Terhubung. Berdaya. Berdampak.")).toBeVisible();
  });

  test("has CTA buttons in hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Mulai Sekarang" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Jelajahi Komunitas" })).toBeVisible();
  });

  test("CTA 'Mulai Sekarang' links to register", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Mulai Sekarang" });
    await expect(cta).toHaveAttribute("href", "/register");
  });

  test("displays features section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mengapa KomunaID?")).toBeVisible();
    await expect(page.getByText("Komunitas Terstruktur")).toBeVisible();
    await expect(page.getByText("Event Management")).toBeVisible();
    await expect(page.getByText("Volunteer Matching")).toBeVisible();
  });

  test("displays statistics section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Statistik Kami")).toBeVisible();
    await expect(page.getByText("Komunitas")).toBeVisible();
    await expect(page.getByText("Anggota")).toBeVisible();
  });

  test("displays 'Jadi Relawan' section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Jadi Relawan, Berikan Dampak")).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat Peluang Volunteer" })).toBeVisible();
  });

  test("displays 'Jadi Komunitas' section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Jadi Komunitas, Bangun Gerakan")).toBeVisible();
    await expect(page.getByRole("link", { name: "Daftar Gratis" })).toBeVisible();
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
    const cta = page.getByRole("link", { name: "Mulai Sekarang" });
    await expect(cta).toBeVisible();
  });

  test("page is responsive on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Mengapa KomunaID?")).toBeVisible();
  });
});
