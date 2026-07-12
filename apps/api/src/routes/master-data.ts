import { Hono } from "hono";
import { prisma } from "@komunaid/database";

export const masterDataRoutes = new Hono();

masterDataRoutes.get("/countries", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_countries" } });
  const countries = setting ? (setting.value as string[]) : [];
  return c.json({ success: true, data: countries });
});

masterDataRoutes.get("/provinces", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_provinces" } });
  const raw = setting ? setting.value : {};
  const country = c.req.query("country");
  if (country && typeof raw === "object" && !Array.isArray(raw)) {
    return c.json({ success: true, data: (raw as Record<string, string[]>)[country] || [] });
  }
  if (Array.isArray(raw)) {
    return c.json({ success: true, data: raw });
  }
  const allProvinces = Object.values(raw as Record<string, string[]>).flat();
  return c.json({ success: true, data: allProvinces });
});

masterDataRoutes.get("/cities", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_cities" } });
  const raw = setting ? setting.value : {};
  const province = c.req.query("province");
  if (province && typeof raw === "object" && !Array.isArray(raw)) {
    return c.json({ success: true, data: (raw as Record<string, string[]>)[province] || [] });
  }
  if (Array.isArray(raw)) {
    return c.json({ success: true, data: raw });
  }
  const allCities = Object.values(raw as Record<string, string[]>).flat();
  return c.json({ success: true, data: allCities });
});

masterDataRoutes.get("/districts", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_districts" } });
  const raw = setting ? setting.value : {};
  const city = c.req.query("city");
  if (city && typeof raw === "object" && !Array.isArray(raw)) {
    return c.json({ success: true, data: (raw as Record<string, string[]>)[city] || [] });
  }
  if (Array.isArray(raw)) {
    return c.json({ success: true, data: raw });
  }
  const allDistricts = Object.values(raw as Record<string, string[]>).flat();
  return c.json({ success: true, data: allDistricts });
});

masterDataRoutes.get("/villages", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_villages" } });
  const raw = setting ? setting.value : {};
  const district = c.req.query("district");
  if (district && typeof raw === "object" && !Array.isArray(raw)) {
    return c.json({ success: true, data: (raw as Record<string, string[]>)[district] || [] });
  }
  if (Array.isArray(raw)) {
    return c.json({ success: true, data: raw });
  }
  const allVillages = Object.values(raw as Record<string, string[]>).flat();
  return c.json({ success: true, data: allVillages });
});

masterDataRoutes.get("/postal-codes", async (c) => {
  const village = c.req.query("village") || "";
  const district = c.req.query("district") || "";

  if (!village) {
    return c.json({ success: true, data: [] });
  }

  try {
    const sanitizedVillage = village.replace(/[^\w\s]/g, "").substring(0, 100);
    const sanitizedDistrict = district.replace(/[^\w\s]/g, "").substring(0, 100);
    const query = encodeURIComponent(`${sanitizedVillage} ${sanitizedDistrict}`.trim());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://carikodepos.id/api/postal-codes?search=${query}&limit=5`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return c.json({ success: true, data: [] });
    }
    const json = await res.json() as any;
    const postalCodes = (json.data?.postalCodes || []).map((item: any) => ({
      code: item.code,
      village: item.village?.name || "",
      district: item.district?.name || "",
      city: item.city?.name || "",
      province: item.province?.name || "",
    }));
    return c.json({ success: true, data: postalCodes });
  } catch {
    return c.json({ success: true, data: [] });
  }
});
