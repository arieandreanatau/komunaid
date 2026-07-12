import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { MESSAGE_CATEGORIES, MESSAGE_STATUSES } from "@komunaid/constants";
import { authMiddleware } from "../middleware/auth";
import { requirePlatformAdmin } from "../middleware/rbac";
import { adminMutationRateLimiter } from "../middleware/admin-rate-limit";
import { contactFormRateLimiter } from "../services/rate-limiter";
import { createAuditLog, AuditActions } from "../services/audit";
import { xssSanitize, sanitizeText } from "../lib/xss";
import { parsePagination, paginatedResponse } from "../lib/pagination";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const contactMessageRoutes = new Hono<Env>();

// ==========================================
// PUBLIC: SUBMIT MESSAGE (Guest)
// ==========================================

contactMessageRoutes.post("/", async (c) => {
  const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip") || "unknown";
  const rateLimit = await contactFormRateLimiter(ip);
  if (!rateLimit.allowed) {
    return c.json({ success: false, message: "Terlalu banyak permintaan. Silakan coba lagi nanti." }, 429);
  }

  const body = await c.req.json();
  const { name, email, subject, message, category } = body;

  if (!name || !email || !subject || !message) {
    return c.json({ success: false, message: "Nama, email, subjek, dan pesan wajib diisi" }, 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ success: false, message: "Format email tidak valid" }, 400);
  }

  const validCategories = Object.values(MESSAGE_CATEGORIES);
  const msgCategory = validCategories.includes(category) ? category : MESSAGE_CATEGORIES.GENERAL;

  const contactMessage = await prisma.contactMessage.create({
    data: {
      name: sanitizeText(name) || "",
      email: email.toLowerCase().trim(),
      subject: sanitizeText(subject) || "",
      message: String(xssSanitize(message)),
      category: msgCategory as any,
    },
  });

  return c.json({
    success: true,
    message: "Pesan berhasil dikirim. Kami akan merespons segera.",
    data: { id: contactMessage.id },
  }, 201);
});

// ==========================================
// ADMIN: LIST MESSAGES
// ==========================================

contactMessageRoutes.get("/admin", authMiddleware, requirePlatformAdmin(), async (c) => {
  const { page, limit, search } = parsePagination(c.req.url);
  const url = new URL(c.req.url);
  const status = url.searchParams.get("status") || "";

  const where: any = {};

  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { subject: { contains: search } },
    ];
  }

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return c.json(paginatedResponse(messages, total, page, limit));
});

contactMessageRoutes.get("/admin/:id", authMiddleware, requirePlatformAdmin(), async (c) => {
  const id = c.req.param("id") as string;

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) {
    return c.json({ success: false, message: "Pesan tidak ditemukan" }, 404);
  }

  if (message.status === MESSAGE_STATUSES.PENDING) {
    await prisma.contactMessage.update({
      where: { id },
      data: { status: MESSAGE_STATUSES.READ },
    });
    message.status = MESSAGE_STATUSES.READ as any;
  }

  return c.json({ success: true, data: message });
});

contactMessageRoutes.put("/admin/:id", authMiddleware, requirePlatformAdmin(), adminMutationRateLimiter(), async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id") as string;
  const body = await c.req.json();
  const { status, reply } = body;

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ success: false, message: "Pesan tidak ditemukan" }, 404);
  }

  const updateData: any = {};
  if (status) updateData.status = status;
  if (reply !== undefined) {
    updateData.reply = reply ? xssSanitize(reply) : null;
    updateData.repliedAt = reply ? new Date() : null;
    updateData.repliedBy = reply ? authUser.id : null;
    if (reply) updateData.status = MESSAGE_STATUSES.REPLIED;
  }

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: updateData,
  });

  return c.json({
    success: true,
    message: "Pesan berhasil diupdate",
    data: updated,
  });
});

contactMessageRoutes.delete("/admin/:id", authMiddleware, requirePlatformAdmin(), adminMutationRateLimiter(), async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id") as string;

  const existing = await prisma.contactMessage.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ success: false, message: "Pesan tidak ditemukan" }, 404);
  }

  await prisma.contactMessage.delete({ where: { id } });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.SETTINGS_UPDATE,
    resourceName: "ContactMessage",
    resourceId: id,
    beforeData: { subject: existing.subject },
  });

  return c.json({ success: true, message: "Pesan berhasil dihapus" });
});
