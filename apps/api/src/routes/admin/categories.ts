import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { validate } from "../../middleware/validate";
import { adminCreateCategorySchema, adminUpdateCategorySchema } from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../../services/audit";
import { isUniqueConstraintError } from "../../lib/slug";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const categoriesRoutes = new Hono<Env>();

categoriesRoutes.get("/categories", async (c) => {
  const url = new URL(c.req.url);
  const type = url.searchParams.get("type") || "";
  const includeInactive = url.searchParams.get("includeInactive") === "true";

  const where: Record<string, any> = {};
  if (!includeInactive) where.isActive = true;
  if (type) where.type = type;

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          communities: true,
          organizations: true,
          events: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    data: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      type: cat.type,
      isActive: cat.isActive,
      communityCount: cat._count.communities,
      organizationCount: cat._count.organizations,
      eventCount: cat._count.events,
      createdAt: cat.createdAt,
    })),
  });
});

categoriesRoutes.post("/categories", validate(adminCreateCategorySchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");
  const { name, description, icon, type } = data as { name: string; description?: string; icon?: string; type?: string };

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return c.json({ success: false, message: "Kategori sudah ada" }, 409);
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        type: (type as any) || "COMMUNITY",
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.SETTINGS_UPDATE,
      resourceName: "Category",
      resourceId: category.id,
      afterData: { name, slug, type: category.type },
    });

    return c.json({ success: true, data: category }, 201);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return c.json({ success: false, message: "Kategori sudah ada" }, 409);
    }
    throw err;
  }
});

categoriesRoutes.put("/categories/:categoryId", validate(adminUpdateCategorySchema), async (c) => {
  const authUser = c.get("user");
  const categoryId = c.req.param("categoryId") as string;
  const data = c.get("validated");

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return c.json({ success: false, message: "Kategori tidak ditemukan" }, 404);
  }

  const before = { name: category.name, description: category.description, icon: category.icon, isActive: category.isActive, type: category.type };

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.type && { type: data.type }),
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Category",
    resourceId: categoryId,
    beforeData: before,
    afterData: { name: updated.name, description: updated.description, isActive: updated.isActive, type: updated.type },
  });

  return c.json({ success: true, data: updated });
});

categoriesRoutes.delete("/categories/:categoryId", async (c) => {
  const authUser = c.get("user");
  const categoryId = c.req.param("categoryId") as string;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return c.json({ success: false, message: "Kategori tidak ditemukan" }, 404);
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive: false },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Category",
    resourceId: categoryId,
    beforeData: { isActive: true },
    afterData: { isActive: false },
  });

  return c.json({ success: true, message: "Kategori berhasil dinonaktifkan" });
});
