import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { CATEGORY_TYPES } from "@komunaid/constants";
import { authMiddleware } from "../middleware/auth";
import { requirePlatformAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { adminCreateCategorySchema, adminUpdateCategorySchema } from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../services/audit";
import { isUniqueConstraintError } from "../lib/slug";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const categoryRoutes = new Hono<Env>();

// ==========================================
// LIST CATEGORIES (Public)
// ==========================================

categoryRoutes.get("/", async (c) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return c.json({ success: true, data: categories });
});

// ==========================================
// CREATE CATEGORY (Admin)
// ==========================================

categoryRoutes.post("/", authMiddleware, requirePlatformAdmin(), validate(adminCreateCategorySchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");
  const { name, description, icon, type } = data as {
    name: string;
    description?: string;
    icon?: string;
    type?: string;
  };

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
        type: (type as any) || CATEGORY_TYPES.COMMUNITY,
      },
    });

    await createAuditLog({
      userId: authUser.id,
      actionType: AuditActions.SETTINGS_UPDATE,
      resourceName: "Category",
      resourceId: category.id,
      afterData: { name: category.name, slug: category.slug, type: category.type },
    });

    return c.json({ success: true, data: category }, 201);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return c.json({ success: false, message: "Kategori sudah ada" }, 409);
    }
    throw err;
  }
});

// ==========================================
// UPDATE CATEGORY (Admin)
// ==========================================

categoryRoutes.put("/:categoryId", authMiddleware, requirePlatformAdmin(), validate(adminUpdateCategorySchema), async (c) => {
  const authUser = c.get("user");
  const categoryId = c.req.param("categoryId") as string;
  const data = c.get("validated");

  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category) {
    return c.json({ success: false, message: "Category not found" }, 404);
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...data,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "Category",
    resourceId: categoryId,
    beforeData: { name: category.name },
    afterData: { name: updated.name, type: updated.type, isActive: updated.isActive },
  });

  return c.json({ success: true, data: updated });
});

// ==========================================
// DELETE CATEGORY (Admin) - Soft
// ==========================================

categoryRoutes.delete("/:categoryId", authMiddleware, requirePlatformAdmin(), async (c) => {
  const authUser = c.get("user");
  const categoryId = c.req.param("categoryId") as string;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category) {
    return c.json({ success: false, message: "Category not found" }, 404);
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
    beforeData: { isActive: category.isActive },
    afterData: { isActive: false },
  });

  return c.json({ success: true, message: "Kategori berhasil dinonaktifkan" });
});
