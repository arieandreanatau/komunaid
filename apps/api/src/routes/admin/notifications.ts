import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { adminBroadcastNotificationSchema } from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../../services/audit";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const notificationsRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

notificationsRoutes.get("/notifications", async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const type = url.searchParams.get("type") || "";

  const where: Record<string, any> = {};
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { message: { contains: search } },
    ];
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return c.json({
    success: true,
    data: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      link: n.link,
      user: n.user,
      createdAt: n.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

notificationsRoutes.post("/notifications/broadcast", requireSuperAdmin(), validate(adminBroadcastNotificationSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");
  const { title, message, type, targetRoles } = data as {
    title: string;
    message: string;
    type?: string;
    targetRoles?: string[];
  };

  const where: Record<string, any> = { deletedAt: null };
  if (targetRoles && targetRoles.length > 0) {
    where.roles = { some: { role: { in: targetRoles } } };
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  if (users.length === 0) {
    return c.json({ success: false, message: "Tidak ada target user" }, 400);
  }

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      title,
      message,
      type: (type as any) || "SYSTEM",
    })),
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.NOTIFICATION_BROADCAST,
    resourceName: "Notification",
    resourceId: "broadcast",
    afterData: { title, targetCount: users.length, targetRoles: targetRoles || ["ALL"] },
  });

  return c.json({ success: true, message: `Notifikasi berhasil dikirim ke ${users.length} user` });
});

notificationsRoutes.get("/notification-templates", async (c) => {
  const templates = await prisma.notificationTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return c.json({
    success: true,
    data: templates.map((t) => ({
      id: t.id,
      name: t.name,
      title: t.title,
      message: t.message,
      type: t.type,
      isActive: t.isActive,
      createdAt: t.createdAt,
    })),
  });
});

notificationsRoutes.post("/notification-templates", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const body = await c.req.json();
  const { name, title, message, type } = body as { name: string; title: string; message: string; type?: string };

  if (!name || !title || !message) {
    return c.json({ success: false, message: "Name, title, dan message wajib diisi" }, 400);
  }

  const template = await prisma.notificationTemplate.create({
    data: {
      name,
      title,
      message,
      type: (type as any) || "SYSTEM",
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "NotificationTemplate",
    resourceId: template.id,
    afterData: { name, title, type: template.type },
  });

  return c.json({ success: true, data: template }, 201);
});

notificationsRoutes.put("/notification-templates/:templateId", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const templateId = c.req.param("templateId") as string;
  const body = await c.req.json();
  const { name, title, message, type, isActive } = body;

  const template = await prisma.notificationTemplate.findUnique({ where: { id: templateId } });
  if (!template) {
    return c.json({ success: false, message: "Template tidak ditemukan" }, 404);
  }

  const updated = await prisma.notificationTemplate.update({
    where: { id: templateId },
    data: {
      ...(name && { name }),
      ...(title && { title }),
      ...(message && { message }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "NotificationTemplate",
    resourceId: templateId,
    afterData: { name: updated.name, isActive: updated.isActive },
  });

  return c.json({ success: true, data: updated });
});

notificationsRoutes.delete("/notification-templates/:templateId", requireSuperAdmin(), async (c) => {
  const templateId = c.req.param("templateId") as string;

  await prisma.notificationTemplate.delete({ where: { id: templateId } });

  return c.json({ success: true, message: "Template berhasil dihapus" });
});
