import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { adminUpdateSettingSchema, adminUpdatePlatformGeneralSchema } from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../../services/audit";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const settingsRoutes = new Hono<Env>();

settingsRoutes.get("/settings", async (c) => {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, any> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return c.json({ success: true, data: settingsMap });
});

settingsRoutes.get("/settings/:key", async (c) => {
  const key = c.req.param("key") as string;
  const setting = await prisma.setting.findUnique({ where: { key } });

  if (!setting) {
    return c.json({ success: false, message: "Setting tidak ditemukan" }, 404);
  }

  return c.json({ success: true, data: { key: setting.key, value: setting.value } });
});

settingsRoutes.put("/settings/:key", requireSuperAdmin(), validate(adminUpdateSettingSchema), async (c) => {
  const authUser = c.get("user");
  const key = c.req.param("key") as string;
  const data = c.get("validated");
  const { value } = data as { value: any };

  const existing = await prisma.setting.findUnique({ where: { key } });
  const before = existing ? { value: existing.value } : null;

  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: key,
    beforeData: before,
    afterData: { value },
  });

  return c.json({ success: true, message: "Setting berhasil diupdate" });
});

settingsRoutes.get("/settings/platform/general", async (c) => {
  const keys = ["platform_name", "platform_description", "platform_url", "support_email", "maintenance_mode"];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const data: Record<string, any> = {};
  settings.forEach((s) => { data[s.key] = s.value; });
  return c.json({ success: true, data });
});

settingsRoutes.put("/settings/platform/general", requireSuperAdmin(), validate(adminUpdatePlatformGeneralSchema), async (c) => {
  const authUser = c.get("user");
  const body = c.get("validated");
  const entries = Object.entries(body);

  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: value as any },
      update: { value: value as any },
    });
  }

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "platform_general",
    afterData: Object.fromEntries(entries.map(([k, v]) => [k, typeof v === "object" ? "updated" : v])),
  });

  return c.json({ success: true, message: "Pengaturan berhasil diupdate" });
});

settingsRoutes.get("/master-data/provinces", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_provinces" } });
  const raw = setting ? setting.value : {};
  return c.json({ success: true, data: raw });
});

settingsRoutes.put("/master-data/provinces", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { provinces } = body as { provinces: Record<string, string[]> };

  if (!provinces || typeof provinces !== "object" || Array.isArray(provinces)) {
    return c.json({ success: false, message: "Data provinsi tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_provinces" },
    create: { key: "master_provinces", value: provinces },
    update: { value: provinces },
  });

  const count = Object.values(provinces).flat().length;

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_provinces",
    afterData: { count },
  });

  return c.json({ success: true, message: "Provinsi berhasil diupdate" });
});

settingsRoutes.get("/master-data/cities", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_cities" } });
  const raw = setting ? setting.value : {};
  return c.json({ success: true, data: raw });
});

settingsRoutes.put("/master-data/cities", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { cities } = body as { cities: Record<string, string[]> };

  if (!cities || typeof cities !== "object" || Array.isArray(cities)) {
    return c.json({ success: false, message: "Data kota tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_cities" },
    create: { key: "master_cities", value: cities },
    update: { value: cities },
  });

  const count = Object.values(cities).flat().length;

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_cities",
    afterData: { count },
  });

  return c.json({ success: true, message: "Kota berhasil diupdate" });
});

settingsRoutes.get("/master-data/countries", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_countries" } });
  const countries = setting ? (setting.value as string[]) : [];
  return c.json({ success: true, data: countries });
});

settingsRoutes.put("/master-data/countries", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { countries } = body as { countries: string[] };

  if (!Array.isArray(countries)) {
    return c.json({ success: false, message: "Data negara tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_countries" },
    create: { key: "master_countries", value: countries },
    update: { value: countries },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_countries",
    afterData: { count: countries.length },
  });

  return c.json({ success: true, message: "Negara berhasil diupdate" });
});

settingsRoutes.get("/master-data/interests", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_interests" } });
  const interests = setting ? (setting.value as string[]) : [];
  return c.json({ success: true, data: interests });
});

settingsRoutes.put("/master-data/interests", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { interests } = body as { interests: string[] };

  if (!Array.isArray(interests)) {
    return c.json({ success: false, message: "Data interest tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_interests" },
    create: { key: "master_interests", value: interests },
    update: { value: interests },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_interests",
    afterData: { count: interests.length },
  });

  return c.json({ success: true, message: "Interest berhasil diupdate" });
});

settingsRoutes.get("/master-data/districts", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_districts" } });
  const raw = setting ? setting.value : {};
  return c.json({ success: true, data: raw });
});

settingsRoutes.put("/master-data/districts", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { districts } = body as { districts: Record<string, string[]> };

  if (!districts || typeof districts !== "object" || Array.isArray(districts)) {
    return c.json({ success: false, message: "Data kecamatan tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_districts" },
    create: { key: "master_districts", value: districts },
    update: { value: districts },
  });

  const count = Object.values(districts).flat().length;

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_districts",
    afterData: { count },
  });

  return c.json({ success: true, message: "Kecamatan berhasil diupdate" });
});

settingsRoutes.get("/master-data/kelurahan", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_kelurahan" } });
  const raw = setting ? setting.value : {};
  return c.json({ success: true, data: raw });
});

settingsRoutes.put("/master-data/kelurahan", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { kelurahan } = body as { kelurahan: Record<string, string[]> };

  if (!kelurahan || typeof kelurahan !== "object" || Array.isArray(kelurahan)) {
    return c.json({ success: false, message: "Data kelurahan tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_kelurahan" },
    create: { key: "master_kelurahan", value: kelurahan },
    update: { value: kelurahan },
  });

  const count = Object.values(kelurahan).flat().length;

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_kelurahan",
    afterData: { count },
  });

  return c.json({ success: true, message: "Kelurahan berhasil diupdate" });
});

settingsRoutes.get("/master-data/tags", async (c) => {
  const setting = await prisma.setting.findUnique({ where: { key: "master_tags" } });
  const tags = setting ? (setting.value as string[]) : [];
  return c.json({ success: true, data: tags });
});

settingsRoutes.put("/master-data/tags", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { tags } = body as { tags: string[] };

  if (!Array.isArray(tags)) {
    return c.json({ success: false, message: "Data tag tidak valid" }, 400);
  }

  await prisma.setting.upsert({
    where: { key: "master_tags" },
    create: { key: "master_tags", value: tags },
    update: { value: tags },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Setting",
    resourceId: "master_tags",
    afterData: { count: tags.length },
  });

  return c.json({ success: true, message: "Tags berhasil diupdate" });
});
