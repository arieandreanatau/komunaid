import { type Page, type Locator, expect } from "@playwright/test";

export class AuthHelper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(identifier: string, password: string) {
    await this.page.goto("/login");
    await this.page.getByLabel("Email atau Username").fill(identifier);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Masuk" }).click();
    await this.page.waitForURL("**/dashboard");
  }

  async loginAsAdmin(identifier: string, password: string) {
    await this.page.goto("/admin/login");
    await this.page.getByLabel("Email atau Username").fill(identifier);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Masuk ke Admin Panel" }).click();
    await this.page.waitForURL("**/admin");
  }

  async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    await this.page.goto("/register");
    await this.page.getByLabel("Nama Lengkap").fill(data.name);
    await this.page.getByLabel("Username").fill(data.username);
    await this.page.getByLabel("Email").fill(data.email);
    await this.page.getByLabel("Password", { exact: true }).fill(data.password);
    await this.page.getByLabel("Konfirmasi Password").fill(data.password);
    await this.page.getByRole("checkbox", { name: /Saya menyetujui/ }).check();
    await this.page.getByRole("button", { name: "Daftar" }).click();
    await this.page.waitForURL("**/dashboard");
  }

  async logout() {
    const userMenu = this.page.getByRole("button", { name: /user|profile|menu/i });
    if (await userMenu.isVisible()) {
      await userMenu.click();
      const logoutBtn = this.page.getByRole("menuitem", { name: /logout|keluar/i });
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
      }
    }
  }

  async setToken(token: string) {
    await this.page.context().addCookies([
      {
        name: "token",
        value: token,
        domain: "localhost",
        path: "/",
      },
    ]);
  }
}

