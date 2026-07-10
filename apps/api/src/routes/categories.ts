import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { authMiddleware } from "../middleware/auth";
import { requirePlatformAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { adminCreateCategorySchema, adminUpdateCategorySchema } from "@komunaid/shared";
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

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      icon,
      type: (type as any) || "COMMUNITY",
    },
  });

  return c.json({ success: true, data: category }, 201);
});

// ==========================================
// UPDATE CATEGORY (Admin)
// ==========================================

categoryRoutes.put("/:categoryId", authMiddleware, requirePlatformAdmin(), validate(adminUpdateCategorySchema), async (c) => {
  const authUser = c.get("user");
  const categoryId = c.req.param("categoryId");
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

  return c.json({ success: true, data: updated });
});

// ==========================================
// DELETE CATEGORY (Admin) - Soft
// ==========================================

categoryRoutes.delete("/:categoryId", authMiddleware, requirePlatformAdmin(), async (c) => {
  const categoryId = c.req.param("categoryId");

  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive: false },
  });

  return c.json({ success: true, message: "Kategori berhasil dinonaktifkan" });
});
