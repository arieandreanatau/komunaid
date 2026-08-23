import { test, expect } from "@playwright/test";
import { mockVolunteer, mockLoginSuccess, mockProfile } from "./helpers/api";

const mockVolunteerData = [
  {
    id: "1",
    title: "Bersih-bersih Pantai",
    slug: "bersih-bersih-pantai",
    description: "Kegiatan volunteer bersih-bersih pantai di Jakarta Selatan",
    status: "OPEN",
    registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
    activityStartDate: new Date(Date.now() + 172800000).toISOString(),
    event: {
      id: "1",
      title: "Beach Cleanup Day",
      slug: "beach-cleanup-day",
      eventDate: new Date(Date.now() + 172800000).toISOString(),
      location: "Jakarta Selatan",
      status: "REGISTRATION_OPEN",
    },
    createdBy: { id: "u1", name: "Admin", avatar: "" },
    positions: [
      { id: "p1", name: "Koordinator", requiredQty: 2 },
      { id: "p2", name: "Peserta", requiredQty: 20 },
    ],
    applicationCount: 10,
    coverImage: null,
    thumbnail: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Guru Mengajar",
    slug: "guru-mengajar",
    description: "Program volunteer mengajar di daerah Bandung",
    status: "OPEN",
    registrationDeadline: new Date(Date.now() + 604800000).toISOString(),
    activityStartDate: new Date(Date.now() + 604800000).toISOString(),
    event: {
      id: "2",
      title: "Teaching Program",
      slug: "teaching-program",
      eventDate: new Date(Date.now() + 604800000).toISOString(),
      location: "Bandung",
      status: "PUBLISHED",
    },
    createdBy: { id: "u2", name: "Organizer", avatar: "" },
    positions: [{ id: "p3", name: "Guru", requiredQty: 5 }],
    applicationCount: 3,
    coverImage: null,
    thumbnail: null,
    createdAt: new Date().toISOString(),
  },
];

test.describe("Volunteer Listing", () => {
  test.beforeEach(async ({ page }) => {
    await mockVolunteer(page, mockVolunteerData);
  });

  test("loads the volunteer directory page", async ({ page }) => {
    await page.goto("/volunteer");
    await expect(page.getByRole("heading", { name: "Rasakan Menjadi Volunteer" })).toBeVisible();
  });

  test("displays status filter tabs", async ({ page }) => {
    await page.goto("/volunteer");
    await expect(page.getByRole("button", { name: "Semua" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Closed" })).toBeVisible();
  });

  test("search input is present", async ({ page }) => {
    await page.goto("/volunteer");
    const searchInput = page.getByPlaceholder("Cari volunteer...");
    await expect(searchInput).toBeVisible();
  });

  test("displays volunteer cards", async ({ page }) => {
    await page.goto("/volunteer");
    await expect(page.getByText("Bersih-bersih Pantai").first()).toBeVisible();
    await expect(page.getByText("Guru Mengajar").first()).toBeVisible();
  });

  test("volunteer cards link to detail page", async ({ page }) => {
    await page.goto("/volunteer");
    const card = page.getByRole("link", { name: "Bersih-bersih Pantai" }).first();
    await expect(card).toHaveAttribute("href", "/volunteer/bersih-bersih-pantai");
  });

  test("shows application count", async ({ page }) => {
    await page.goto("/volunteer");
    await expect(page.getByText("10 pendaftar").first()).toBeVisible();
  });

  test("shows position tags", async ({ page }) => {
    await page.goto("/volunteer");
    await expect(page.getByText("Koordinator").first()).toBeVisible();
    await expect(page.getByText("Peserta").first()).toBeVisible();
  });

  test("sort dropdown is present", async ({ page }) => {
    await page.goto("/volunteer");
    const sortSelect = page.getByLabel("Urutkan volunteer");
    await expect(sortSelect).toBeVisible();
  });

  test("total count is displayed", async ({ page }) => {
    await page.goto("/volunteer");
    await expect(page.getByText(/kesempatan volunteer ditemukan/)).toBeVisible();
  });

  test("page is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/volunteer");
    await expect(page.getByRole("heading", { name: "Rasakan Menjadi Volunteer" })).toBeVisible();
  });
});

test.describe("Volunteer - Detail Page", () => {
  test("navigates to volunteer detail from listing", async ({ page }) => {
    await mockVolunteer(page, mockVolunteerData);
    await page.goto("/volunteer");
    const detailLink = page.locator('a[href*="bersih-bersih-pantai"]').first();
    await detailLink.click();
    await page.waitForURL(/volunteer\/bersih-bersih-pantai/);
    await expect(page).toHaveURL(/volunteer\/bersih-bersih-pantai/);
  });
});

test.describe("Volunteer - Apply", () => {
  test("apply button requires authentication", async ({ page }) => {
    await mockVolunteer(page, mockVolunteerData);
    await page.goto("/volunteer/bersih-bersih-pantai");
    await page.waitForTimeout(1000);
    const applyBtn = page.getByRole("button", { name: /daftar|apply|submit/i });
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await expect(page).toHaveURL(/login/);
    }
  });
});
