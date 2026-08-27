import { test, expect, type Page } from "@playwright/test";
import { mockLoginSuccess, mockProfile } from "./helpers/api";
import { SignJWT } from "jose";

const COMMUNITY_ID = "comm-1";

const dashboardPayload = {
  communityInfo: {
    id: COMMUNITY_ID,
    name: "Tech Jakarta",
    slug: "tech-jakarta",
    description: "Komunitas teknologi di Jakarta",
    visibility: "PUBLIC",
    membershipType: "OPEN",
    status: "APPROVED",
    coverImage: null,
    logo: null,
    banner: null,
    location: "Jakarta",
    website: null,
    owner: { id: "test-user-id", name: "Test User", avatar: null },
    settings: null,
    tags: [],
    createdAt: new Date().toISOString(),
  },
  memberCount: 10,
  pendingJoinRequestCount: 2,
  activeEventCount: 3,
  recentActivity: [],
};

async function setAuthCookie(page: Page) {
  const token = await new SignJWT({
    email: "test@example.com",
    name: "Test User",
    type: "access",
    roles: ["MEMBER"],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("test-user-id")
    .setIssuedAt()
    .setExpirationTime("1h")
     .sign(new TextEncoder().encode("test-playwright-jwt-secret-32-characters-minimum"));
  return page.context().addCookies([
    { name: "token", value: token, domain: "localhost", path: "/" },
  ]);
}

async function mockDashboard(page: Page) {
  await page.route(/\/api\/v1\/communities\/(tech-jakarta|comm-1)$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: dashboardPayload.communityInfo }),
    });
  });
  await page.route(`**/api/v1/communities/${COMMUNITY_ID}/dashboard`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: dashboardPayload }),
    });
  });
}

test.describe("Community Settings - Edit", () => {
  test.beforeEach(async ({ page }) => {
    await setAuthCookie(page);
    await mockLoginSuccess(page);
    await mockProfile(page, {
      id: "test-user-id",
      name: "Test User",
      roles: ["USER"],
      communities: [
        {
          id: COMMUNITY_ID,
          name: "Tech Jakarta",
          slug: "tech-jakarta",
          role: "OWNER",
          status: "APPROVED",
        },
      ],
      events: [],
    });
    await mockDashboard(page);
    await page.goto(`/dashboard/communities/${COMMUNITY_ID}/settings`);
    await expect(page.getByText("Pengaturan Komunitas")).toBeVisible();
  });

  test("does not render invalid Status dropdown", async ({ page }) => {
    await expect(page.getByLabel("Status")).toHaveCount(0);
    await expect(page.getByRole("option", { name: "Nonaktif" })).toHaveCount(0);
  });

  test("saves settings without a status field", async ({ page }) => {
    let requestBody: Record<string, unknown> | null = null;

    await page.route(`**/api/v1/communities/${COMMUNITY_ID}`, async (route) => {
      if (route.request().method() === "PUT") {
        requestBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, message: "Komunitas berhasil diupdate" }),
        });
      } else {
        await route.continue();
      }
    });

    const nameInput = page.locator("input[type=text]").first();
    await nameInput.fill("Tech Jakarta Baru");
    await page.getByRole("button", { name: "Simpan Perubahan" }).click();
    await expect(page.getByText("Pengaturan berhasil disimpan!")).toBeVisible();

    expect(requestBody).not.toBeNull();
    expect(requestBody).not.toHaveProperty("status");
    expect(requestBody).toMatchObject({
      name: "Tech Jakarta Baru",
      visibility: "PUBLIC",
      membershipType: "OPEN",
    });
  });
});
