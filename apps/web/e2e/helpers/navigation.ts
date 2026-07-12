import { type Page, type Locator, expect } from "@playwright/test";

export class NavigationHelper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoHome() {
    await this.page.goto("/");
  }

  async gotoCommunities() {
    await this.page.goto("/communities");
  }

  async gotoEvents() {
    await this.page.goto("/events");
  }

  async gotoVolunteer() {
    await this.page.goto("/volunteer");
  }

  async gotoDashboard() {
    await this.page.goto("/dashboard");
  }

  async gotoAdmin() {
    await this.page.goto("/admin");
  }

  async clickNavLink(text: string) {
    await this.page.getByRole("link", { name: text }).first().click();
  }

  async expectHeaderVisible() {
    const header = this.page.locator("header");
    await expect(header).toBeVisible();
  }

  async expectFooterVisible() {
    const footer = this.page.locator("footer");
    await expect(footer).toBeVisible();
  }

  async expectLogoVisible() {
    const logo = this.page.locator("header").getByRole("link", { name: /komunaid/i });
    await expect(logo).toBeVisible();
  }

  async toggleMobileMenu() {
    const menuButton = this.page.getByRole("button", { name: /menu|navigation/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  }

  async expectMobileMenuVisible() {
    const mobileMenu = this.page.locator("[data-mobile-menu]");
    await expect(mobileMenu).toBeVisible();
  }
}
