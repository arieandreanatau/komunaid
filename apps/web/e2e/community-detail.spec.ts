import { test, expect } from "@playwright/test";

function communityDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: "comm-1",
    name: "Komunitas Buku Jakarta",
    slug: "komunitas-buku-jakarta",
    description: "Komunitas pencinta buku di Jakarta",
    coverImage: null,
    logo: null,
    banner: null,
    location: "Jakarta",
    website: null,
    instagram: null,
    contactEmail: null,
    contactPhone: null,
    membershipType: "OPEN",
    visibility: "PUBLIC",
    status: "APPROVED",
    owner: { id: "u1", name: "Rina", avatar: null },
    memberCount: 42,
    eventCount: 3,
    membersPreview: [
      { id: "u1", name: "Rina", avatar: null, role: "OWNER" },
      { id: "u2", name: "Budi", avatar: null, role: "ADMIN" },
      { id: "u3", name: "Sari", avatar: null, role: "MEMBER" },
    ],
    officers: [
      { id: "u1", name: "Rina", avatar: null, role: "OWNER" },
      { id: "u2", name: "Budi", avatar: null, role: "ADMIN" },
      { id: "u4", name: "Dewi", avatar: null, role: "EVENT_MANAGER" },
      { id: "u5", name: "Agus", avatar: null, role: "VOLUNTEER_COORDINATOR" },
    ],
    upcomingEvents: [],
    currentEvents: [],
    pastEvents: [],
    futureEvents: [],
    categories: [{ id: "c1", name: "Literasi" }],
    tags: [],
    settings: { showMemberList: true, showEventList: true },
    userMembership: null,
    pendingJoinRequests: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function volunteerProgram(overrides: Record<string, unknown> = {}) {
  return {
    id: "vp-1",
    title: "Relawan Festival Literasi",
    slug: "relawan-festival-literasi",
    status: "REGISTRATION_OPEN",
    startDate: "2026-09-15T00:00:00.000Z",
    endDate: "2026-09-16T00:00:00.000Z",
    applicationCount: 3,
    ...overrides,
  };
}

test.describe("Community Detail - Officers & Volunteer Sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Unauthorized" }),
      });
    });
    await page.route("**/api/v1/communities?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route("**/api/v1/communities/comm-1/media*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });
  });

  test("renders community officers with role labels", async ({ page }) => {
    await page.route("**/api/v1/communities/komunitas-buku-jakarta", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: communityDetail() }),
      });
    });
    await page.route("**/api/v1/volunteer-programs?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/communities/komunitas-buku-jakarta");

    await expect(page.getByRole("heading", { name: "Pengurus" })).toBeVisible();
    await expect(page.getByText("Dewi", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Agus", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Pengelola Event", { exact: true })).toBeVisible();
    await expect(page.getByText("Koordinator Volunteer", { exact: true })).toBeVisible();
    await expect(page.getByText("Pemilik", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Admin", { exact: true }).first()).toBeVisible();
  });

  test("hides officers card when member list is private", async ({ page }) => {
    await page.route("**/api/v1/communities/komunitas-buku-jakarta", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: communityDetail({ settings: { showMemberList: false, showEventList: true } }) }),
      });
    });
    await page.route("**/api/v1/volunteer-programs?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/communities/komunitas-buku-jakarta");

    await expect(page.getByRole("heading", { name: "Pengurus" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Tentang Komunitas" })).toBeVisible();
  });

  test("lists volunteer opportunities of the community with status labels", async ({ page }) => {
    await page.route("**/api/v1/communities/komunitas-buku-jakarta", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: communityDetail() }),
      });
    });
    await page.route("**/api/v1/volunteer-programs?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            volunteerProgram(),
            volunteerProgram({ id: "vp-2", title: "Dokumentasi Acara", slug: "dokumentasi-acara", status: "SCHEDULED", applicationCount: 0 }),
          ],
        }),
      });
    });

    await page.goto("/communities/komunitas-buku-jakarta");

    await expect(page.getByRole("heading", { name: "Kesempatan Volunteer" })).toBeVisible();
    await expect(page.getByText("Relawan Festival Literasi", { exact: true })).toBeVisible();
    await expect(page.getByText("Dokumentasi Acara", { exact: true })).toBeVisible();
    await expect(page.getByText("Menerima Pendaftaran", { exact: true })).toBeVisible();
    await expect(page.getByText("Terjadwal", { exact: true })).toBeVisible();
    const link = page.getByRole("link", { name: "Relawan Festival Literasi" });
    await expect(link).toHaveAttribute("href", "/volunteer/relawan-festival-literasi");
  });

  test("shows volunteer empty state when the community has no opportunities", async ({ page }) => {
    await page.route("**/api/v1/communities/komunitas-buku-jakarta", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: communityDetail() }),
      });
    });
    await page.route("**/api/v1/volunteer-programs?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/communities/komunitas-buku-jakarta");

    await expect(page.getByText("Belum ada kesempatan volunteer.")).toBeVisible();
  });
});