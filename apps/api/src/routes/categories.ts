import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { authMiddleware } from "../middleware/auth";
import { requirePlatformAdmin } from "../middleware/rbac";
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

  return c.json({ categories });
});

// ==========================================
// CREATE CATEGORY (Admin)
// ==========================================

categoryRoutes.post("/", authMiddleware, requirePlatformAdmin(), async (c) => {
  const body = await c.req.json();
  const { name, description, icon } = body;

  if (!name) {
    return c.json({ error: "Nama kategori wajib diisi" }, 400);
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await prisma.category.findUnique({ where: { slug } });

  if (existing) {
    return c.json({ error: "Kategori sudah ada" }, 409);
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      icon,
    },
  });

  return c.json({ category }, 201);
});

// ==========================================
// UPDATE CATEGORY (Admin)
// ==========================================

categoryRoutes.put("/:categoryId", authMiddleware, requirePlatformAdmin(), async (c) => {
  const categoryId = c.req.param("categoryId");
  const body = await c.req.json();
  const { name, description, icon, isActive } = body;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });

  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return c.json({ category: updated });
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

  return c.json({ message: "Kategori berhasil dinonaktifkan" });
});
