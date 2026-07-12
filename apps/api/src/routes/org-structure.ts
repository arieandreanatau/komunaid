import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { authMiddleware } from "../middleware/auth";
import { requirePlatformAdmin, requireSuperAdmin } from "../middleware/rbac";
import { adminMutationRateLimiter } from "../middleware/admin-rate-limit";
import { createAuditLog, AuditActions } from "../services/audit";
import { xssSanitize, sanitizeText } from "../lib/xss";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const orgStructureRoutes = new Hono<Env>();

// ==========================================
// PUBLIC: GET FULL STRUCTURE
// ==========================================

orgStructureRoutes.get("/", async (c) => {
  const structures = await prisma.organizationStructure.findMany({
    where: { isActive: true },
    include: {
      children: {
        where: { isActive: true },
        include: {
          children: {
            where: { isActive: true },
            include: {
              organizationStructureMembers: {
                where: { isActive: true },
                orderBy: { order: "asc" },
              },
              children: {
                where: { isActive: true },
                include: {
                  organizationStructureMembers: {
                    where: { isActive: true },
                    orderBy: { order: "asc" },
                  },
                },
                orderBy: { position: "asc" },
              },
            },
            orderBy: { position: "asc" },
          },
          organizationStructureMembers: {
            where: { isActive: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
      organizationStructureMembers: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { position: "asc" },
  });

  const topLevel = structures.filter((s) => !s.parentId);

  return c.json({ success: true, data: topLevel });
});

orgStructureRoutes.get("/flat", async (c) => {
  const structures = await prisma.organizationStructure.findMany({
    where: { isActive: true },
    include: {
      organizationStructureMembers: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
      parent: {
        select: { id: true, title: true },
      },
    },
    orderBy: { position: "asc" },
  });

  return c.json({ success: true, data: structures });
});

// ==========================================
// ADMIN: CRUD
// ==========================================

orgStructureRoutes.get("/admin/all", authMiddleware, requireSuperAdmin(), async (c) => {
  const structures = await prisma.organizationStructure.findMany({
    include: {
      organizationStructureMembers: { orderBy: { order: "asc" } },
      parent: { select: { id: true, title: true } },
      _count: { select: { children: true, organizationStructureMembers: true } },
    },
    orderBy: { position: "asc" },
  });

  return c.json({ success: true, data: structures });
});

orgStructureRoutes.post("/admin", authMiddleware, requireSuperAdmin(), adminMutationRateLimiter(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { title, description, imageUrl, parentId, position } = body;

  if (!title) {
    return c.json({ success: false, message: "Title wajib diisi" }, 400);
  }

  const structure = await prisma.organizationStructure.create({
    data: {
      title: sanitizeText(title) as string,
      description: description ? (sanitizeText(description) as string) : null,
      imageUrl: imageUrl || null,
      parentId: parentId || null,
      position: position || 0,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "OrganizationStructure",
    resourceId: structure.id,
    afterData: { title: structure.title },
  });

  return c.json({
    success: true,
    message: "Struktur organisasi berhasil dibuat",
    data: structure,
  }, 201);
});

orgStructureRoutes.put("/admin/:id", authMiddleware, requireSuperAdmin(), adminMutationRateLimiter(), async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id") as string;
  const body = await c.req.json();
  const { title, description, imageUrl, parentId, position, isActive } = body;

  const existing = await prisma.organizationStructure.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ success: false, message: "Struktur tidak ditemukan" }, 404);
  }

  if (parentId === id) {
    return c.json({ success: false, message: "Parent tidak boleh diri sendiri" }, 400);
  }

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = sanitizeText(title) as string;
  if (description !== undefined) updateData.description = description ? (sanitizeText(description) as string) : null;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
  if (parentId !== undefined) updateData.parentId = parentId || null;
  if (position !== undefined) updateData.position = position;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await prisma.organizationStructure.update({
    where: { id },
    data: updateData as any,
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "OrganizationStructure",
    resourceId: id,
    beforeData: { title: existing.title },
    afterData: { title: updated.title },
  });

  return c.json({
    success: true,
    message: "Struktur organisasi berhasil diupdate",
    data: updated,
  });
});

orgStructureRoutes.delete("/admin/:id", authMiddleware, requireSuperAdmin(), adminMutationRateLimiter(), async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id") as string;

  const existing = await prisma.organizationStructure.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ success: false, message: "Struktur tidak ditemukan" }, 404);
  }

  await prisma.organizationStructure.delete({ where: { id } });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "OrganizationStructure",
    resourceId: id,
    beforeData: { title: existing.title },
  });

  return c.json({ success: true, message: "Struktur organisasi berhasil dihapus" });
});

// ==========================================
// ADMIN: MEMBER CRUD
// ==========================================

orgStructureRoutes.post("/admin/:structureId/members", authMiddleware, requireSuperAdmin(), adminMutationRateLimiter(), async (c) => {
  const authUser = c.get("user");
  const structureId = c.req.param("structureId") as string;
  const body = await c.req.json();
  const { name, position: memberPosition, email, phone, avatar, bio, order } = body;

  if (!name || !memberPosition) {
    return c.json({ success: false, message: "Name dan position wajib diisi" }, 400);
  }

  const structure = await prisma.organizationStructure.findUnique({ where: { id: structureId } });
  if (!structure) {
    return c.json({ success: false, message: "Struktur tidak ditemukan" }, 404);
  }

  const member = await prisma.organizationStructureMember.create({
    data: {
      structureId,
      name: sanitizeText(name) as string,
      position: sanitizeText(memberPosition) as string,
      email: email || null,
      phone: phone || null,
      avatar: avatar || null,
      bio: bio ? (sanitizeText(bio) as string) : null,
      order: order || 0,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "OrganizationStructureMember",
    resourceId: member.id,
    afterData: { name: member.name, position: member.position },
  });

  return c.json({
    success: true,
    message: "Anggota struktur berhasil ditambahkan",
    data: member,
  }, 201);
});

orgStructureRoutes.put("/admin/members/:memberId", authMiddleware, requireSuperAdmin(), adminMutationRateLimiter(), async (c) => {
  const authUser = c.get("user");
  const memberId = c.req.param("memberId") as string;
  const body = await c.req.json();
  const { name, position: memberPosition, email, phone, avatar, bio, order, isActive } = body;

  const existing = await prisma.organizationStructureMember.findUnique({ where: { id: memberId } });
  if (!existing) {
    return c.json({ success: false, message: "Anggota tidak ditemukan" }, 404);
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = sanitizeText(name) as string;
  if (memberPosition !== undefined) updateData.position = sanitizeText(memberPosition) as string;
  if (email !== undefined) updateData.email = email || null;
  if (phone !== undefined) updateData.phone = phone || null;
  if (avatar !== undefined) updateData.avatar = avatar || null;
  if (bio !== undefined) updateData.bio = bio ? (sanitizeText(bio) as string) : null;
  if (order !== undefined) updateData.order = order;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await prisma.organizationStructureMember.update({
    where: { id: memberId },
    data: updateData as any,
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "OrganizationStructureMember",
    resourceId: memberId,
    beforeData: { name: existing.name },
    afterData: { name: updated.name },
  });

  return c.json({
    success: true,
    message: "Anggota struktur berhasil diupdate",
    data: updated,
  });
});

orgStructureRoutes.delete("/admin/members/:memberId", authMiddleware, requireSuperAdmin(), adminMutationRateLimiter(), async (c) => {
  const authUser = c.get("user");
  const memberId = c.req.param("memberId") as string;

  const existing = await prisma.organizationStructureMember.findUnique({ where: { id: memberId } });
  if (!existing) {
    return c.json({ success: false, message: "Anggota tidak ditemukan" }, 404);
  }

  await prisma.organizationStructureMember.delete({ where: { id: memberId } });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "OrganizationStructureMember",
    resourceId: memberId,
    beforeData: { name: existing.name },
  });

  return c.json({ success: true, message: "Anggota struktur berhasil dihapus" });
});
