import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

vi.mock("@komunaid/database", () => {
  const handlers: Record<string, any> = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  };
  const prisma: any = new Proxy({}, {
    get(_: any, table: string) { return handlers; },
  });
  return { prisma };
});

vi.mock("pino", () => ({
  default: vi.fn(() => ({
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis(),
  })),
}));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));

import { prisma } from "@komunaid/database";
import { masterDataRoutes } from "../../../src/routes/master-data";

describe("Master Data Routes", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route("/master-data", masterDataRoutes);
  });

  // ==========================================
  // GET /countries
  // ==========================================
  describe("GET /countries", () => {
    it("should return countries from settings", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_countries",
        value: ["Indonesia", "Malaysia", "Singapore"],
      });

      const res = await app.request("/master-data/countries");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(["Indonesia", "Malaysia", "Singapore"]);
    });

    it("should return empty array when setting not found", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/master-data/countries");
      const body = await res.json();
      expect(body.data).toEqual([]);
    });
  });

  // ==========================================
  // GET /provinces
  // ==========================================
  describe("GET /provinces", () => {
    it("should return all provinces when no country filter", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_provinces",
        value: {
          "Indonesia": ["DKI Jakarta", "Jawa Barat"],
          "Malaysia": ["Kuala Lumpur"],
        },
      });

      const res = await app.request("/master-data/provinces");
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(["DKI Jakarta", "Jawa Barat", "Kuala Lumpur"]);
    });

    it("should filter by country param", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_provinces",
        value: {
          "Indonesia": ["DKI Jakarta", "Jawa Barat"],
          "Malaysia": ["Kuala Lumpur"],
        },
      });

      const res = await app.request("/master-data/provinces?country=Indonesia");
      const body = await res.json();
      expect(body.data).toEqual(["DKI Jakarta", "Jawa Barat"]);
    });

    it("should return empty array for non-existent country", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_provinces",
        value: { "Indonesia": ["DKI Jakarta"] },
      });

      const res = await app.request("/master-data/provinces?country=Japan");
      const body = await res.json();
      expect(body.data).toEqual([]);
    });

    it("should handle array value format", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_provinces",
        value: ["Province1", "Province2"],
      });

      const res = await app.request("/master-data/provinces");
      const body = await res.json();
      expect(body.data).toEqual(["Province1", "Province2"]);
    });
  });

  // ==========================================
  // GET /cities
  // ==========================================
  describe("GET /cities", () => {
    it("should return all cities when no province filter", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_cities",
        value: {
          "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan"],
          "Jawa Barat": ["Bandung"],
        },
      });

      const res = await app.request("/master-data/cities");
      const body = await res.json();
      expect(body.data).toEqual(["Jakarta Pusat", "Jakarta Selatan", "Bandung"]);
    });

    it("should filter by province param", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_cities",
        value: {
          "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan"],
          "Jawa Barat": ["Bandung"],
        },
      });

      const res = await app.request("/master-data/cities?province=DKI Jakarta");
      const body = await res.json();
      expect(body.data).toEqual(["Jakarta Pusat", "Jakarta Selatan"]);
    });

    it("should return empty for non-existent province", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_cities",
        value: { "DKI Jakarta": ["Jakarta Pusat"] },
      });

      const res = await app.request("/master-data/cities?province=Bali");
      const body = await res.json();
      expect(body.data).toEqual([]);
    });
  });

  // ==========================================
  // GET /districts
  // ==========================================
  describe("GET /districts", () => {
    it("should return districts filtered by city", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_districts",
        value: {
          "Jakarta Pusat": ["Menteng", "Tanah Abang"],
          "Bandung": ["Coblong"],
        },
      });

      const res = await app.request("/master-data/districts?city=Jakarta Pusat");
      const body = await res.json();
      expect(body.data).toEqual(["Menteng", "Tanah Abang"]);
    });

    it("should return all districts without filter", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_districts",
        value: {
          "Jakarta Pusat": ["Menteng"],
          "Bandung": ["Coblong"],
        },
      });

      const res = await app.request("/master-data/districts");
      const body = await res.json();
      expect(body.data).toEqual(["Menteng", "Coblong"]);
    });
  });

  // ==========================================
  // GET /villages
  // ==========================================
  describe("GET /villages", () => {
    it("should return villages filtered by district", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_villages",
        value: {
          "Menteng": ["Menteng Dalam", "Kebon Sirih"],
          "Coblong": ["Lebakgede"],
        },
      });

      const res = await app.request("/master-data/villages?district=Menteng");
      const body = await res.json();
      expect(body.data).toEqual(["Menteng Dalam", "Kebon Sirih"]);
    });

    it("should return all villages without filter", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_villages",
        value: {
          "Menteng": ["Menteng Dalam"],
          "Coblong": ["Lebakgede"],
        },
      });

      const res = await app.request("/master-data/villages");
      const body = await res.json();
      expect(body.data).toEqual(["Menteng Dalam", "Lebakgede"]);
    });
  });

  // ==========================================
  // GET /kelurahan (alias)
  // ==========================================
  describe("GET /kelurahan", () => {
    it("should return kelurahan filtered by district from master_kelurahan key", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_kelurahan",
        value: {
          Menteng: ["Menteng Dalam", "Kebon Sirih"],
          Coblong: ["Lebakgede"],
        },
      });

      const res = await app.request("/master-data/kelurahan?district=Menteng");
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(["Menteng Dalam", "Kebon Sirih"]);
    });

    it("should fall back to master_villages key when master_kelurahan missing", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue({
        key: "master_villages",
        value: {
          Menteng: ["Menteng Dalam"],
        },
      });

      const res = await app.request("/master-data/kelurahan");
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(["Menteng Dalam"]);
    });

    it("should return empty array when no data", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/master-data/kelurahan?district=X");
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });
  });

  // ==========================================
  // GET /postal-codes
  // ==========================================
  describe("GET /postal-codes", () => {
    it("should return empty array when no village param", async () => {
      const res = await app.request("/master-data/postal-codes");
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it("should return empty array when village is empty string", async () => {
      const res = await app.request("/master-data/postal-codes?village=");
      const body = await res.json();
      expect(body.data).toEqual([]);
    });

    it("should handle missing settings gracefully", async () => {
      (prisma.setting.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/master-data/countries");
      const body = await res.json();
      expect(body.data).toEqual([]);
    });
  });
});
