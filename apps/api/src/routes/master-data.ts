import { Hono } from "hono";
import { prisma } from "@komunaid/database";

export const masterDataRoutes = new Hono();

async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting ? setting.value : undefined;
}

async function readRecord(firstKey: string, fallbackKey?: string): Promise<unknown> {
  const value = await getSetting(firstKey);
  if (value !== undefined) return value;
  if (fallbackKey && fallbackKey !== firstKey) return getSetting(fallbackKey);
  return {};
}

function filterByKey(raw: unknown, key?: string): unknown {
  if (!key || typeof raw !== "object" || Array.isArray(raw)) return raw;
  return (raw as Record<string, string[]>)[key] || [];
}

masterDataRoutes.get("/countries", async (c) => {
  const countries = (await getSetting("master_countries")) as string[] | undefined;
  return c.json({ success: true, data: countries || [] });
});

masterDataRoutes.get("/provinces", async (c) => {
  const raw = await readRecord("master_provinces");
  const country = c.req.query("country");
  const data = country ? filterByKey(raw, country) : raw;
  return c.json({
    success: true,
    data: Array.isArray(data) ? data : Object.values((data as Record<string, string[]>) || {}).flat(),
  });
});

masterDataRoutes.get("/cities", async (c) => {
  const raw = await readRecord("master_cities");
  const province = c.req.query("province");
  const data = province ? filterByKey(raw, province) : raw;
  return c.json({
    success: true,
    data: Array.isArray(data) ? data : Object.values((data as Record<string, string[]>) || {}).flat(),
  });
});

masterDataRoutes.get("/districts", async (c) => {
  const raw = await readRecord("master_districts");
  const city = c.req.query("city");
  const data = city ? filterByKey(raw, city) : raw;
  return c.json({
    success: true,
    data: Array.isArray(data) ? data : Object.values((data as Record<string, string[]>) || {}).flat(),
  });
});

const readVillages = async () => readRecord("master_kelurahan", "master_villages");

masterDataRoutes.get("/villages", async (c) => {
  const raw = await readVillages();
  const district = c.req.query("district");
  const data = district ? filterByKey(raw, district) : raw;
  return c.json({
    success: true,
    data: Array.isArray(data) ? data : Object.values((data as Record<string, string[]>) || {}).flat(),
  });
});

// Alias for frontend pages that use the "kelurahan" naming.
masterDataRoutes.get("/kelurahan", async (c) => {
  const raw = await readVillages();
  const district = c.req.query("district");
  const data = district ? filterByKey(raw, district) : raw;
  return c.json({
    success: true,
    data: Array.isArray(data) ? data : Object.values((data as Record<string, string[]>) || {}).flat(),
  });
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