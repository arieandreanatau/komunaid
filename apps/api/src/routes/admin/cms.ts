import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { requireSuperAdmin } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import {
  adminCreateCmsPageSchema,
  adminUpdateCmsPageSchema,
  adminCreateBannerSchema,
  adminUpdateBannerSchema,
} from "@komunaid/shared";
import { createAuditLog, AuditActions } from "../../services/audit";
import { sanitizeText } from "../../lib/xss";
import { isUniqueConstraintError } from "../../lib/slug";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const cmsRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

cmsRoutes.get("/cms/pages", async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const isPublished = url.searchParams.get("isPublished");

  const where: Record<string, any> = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  if (isPublished !== null && isPublished !== undefined && isPublished !== "") {
    where.isPublished = isPublished === "true";
  }

  const [pages, total] = await Promise.all([
    prisma.cmsPage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.cmsPage.count({ where }),
  ]);

  return c.json({
    success: true,
    data: pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      content: p.content,
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      isPublished: p.isPublished,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

cmsRoutes.get("/cms/pages/:slug", async (c) => {
  const slug = c.req.param("slug") as string;
  const page = await prisma.cmsPage.findUnique({ where: { slug } });

  if (!page) {
    return c.json({ success: false, message: "Halaman tidak ditemukan" }, 404);
  }

  return c.json({
    success: true,
    data: {
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDesc: page.metaDesc,
      isPublished: page.isPublished,
      publishedAt: page.publishedAt,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    },
  });
});

cmsRoutes.post("/cms/pages", requireSuperAdmin(), validate(adminCreateCmsPageSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const existing = await prisma.cmsPage.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return c.json({ success: false, message: "Slug sudah digunakan" }, 409);
  }

  try {
    const page = await prisma.cmsPage.create({
      data: {
        slug: data.slug,
        title: data.title,
      content: data.content,
      metaTitle: data.metaTitle,
      metaDesc: data.metaDesc,
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_PAGE_CREATE,
    resourceName: "CmsPage",
    resourceId: page.id,
    afterData: { slug: page.slug, title: page.title },
  });

  return c.json({ success: true, data: page }, 201);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return c.json({ success: false, message: "Slug sudah digunakan" }, 409);
    }
    throw err;
  }
});

cmsRoutes.put("/cms/pages/:id", requireSuperAdmin(), validate(adminUpdateCmsPageSchema), async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id") as string;
  const data = c.get("validated");

  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ success: false, message: "Halaman tidak ditemukan" }, 404);
  }

  const before = { title: existing.title, isPublished: existing.isPublished };

  const page = await prisma.cmsPage.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
      ...(data.metaDesc !== undefined && { metaDesc: data.metaDesc }),
      ...(data.isPublished !== undefined && {
        isPublished: data.isPublished,
        publishedAt: data.isPublished && !existing.isPublished ? new Date() : existing.publishedAt,
      }),
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_PAGE_UPDATE,
    resourceName: "CmsPage",
    resourceId: id,
    beforeData: before,
    afterData: { title: page.title, isPublished: page.isPublished },
  });

  return c.json({ success: true, data: page });
});

cmsRoutes.delete("/cms/pages/:id", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id") as string;

  const page = await prisma.cmsPage.findUnique({ where: { id } });
  if (!page) {
    return c.json({ success: false, message: "Halaman tidak ditemukan" }, 404);
  }

  await prisma.cmsPage.delete({ where: { id } });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_PAGE_DELETE,
    resourceName: "CmsPage",
    resourceId: id,
    beforeData: { slug: page.slug, title: page.title },
  });

  return c.json({ success: true, message: "Halaman berhasil dihapus" });
});

cmsRoutes.get("/cms/banners", async (c) => {
  const banners = await prisma.cmsBanner.findMany({
    orderBy: { position: "asc" },
  });

  return c.json({
    success: true,
    data: banners.map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      position: b.position,
      isActive: b.isActive,
      createdAt: b.createdAt,
    })),
  });
});

cmsRoutes.post("/cms/banners", requireSuperAdmin(), validate(adminCreateBannerSchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const banner = await prisma.cmsBanner.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      position: data.position,
      isActive: data.isActive,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_BANNER_CREATE,
    resourceName: "CmsBanner",
    resourceId: banner.id,
    afterData: { title: banner.title },
  });

  return c.json({ success: true, data: banner }, 201);
});

cmsRoutes.put("/cms/banners/:id", requireSuperAdmin(), validate(adminUpdateBannerSchema), async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id") as string;
  const data = c.get("validated");

  const existing = await prisma.cmsBanner.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ success: false, message: "Banner tidak ditemukan" }, 404);
  }

  const banner = await prisma.cmsBanner.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl || null }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_BANNER_UPDATE,
    resourceName: "CmsBanner",
    resourceId: id,
    afterData: { title: banner.title, isActive: banner.isActive },
  });

  return c.json({ success: true, data: banner });
});

cmsRoutes.delete("/cms/banners/:id", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user");
  const id = c.req.param("id") as string;

  const banner = await prisma.cmsBanner.findUnique({ where: { id } });
  if (!banner) {
    return c.json({ success: false, message: "Banner tidak ditemukan" }, 404);
  }

  await prisma.cmsBanner.delete({ where: { id } });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_BANNER_DELETE,
    resourceName: "CmsBanner",
    resourceId: id,
    beforeData: { title: banner.title },
  });

  return c.json({ success: true, message: "Banner berhasil dihapus" });
});

cmsRoutes.get("/cms/contact", async (c) => {
  const contact = await prisma.cmsContact.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!contact) {
    return c.json({
      success: true,
      data: {
        companyName: "PT Komuna Digital Indonesia",
        phone: null,
        address: null,
        email: "info@komuna.id",
        instagram: null,
        facebook: null,
        twitter: null,
        threads: null,
        website: null,
        mapsUrl: null,
      },
    });
  }

  return c.json({ success: true, data: contact });
});

cmsRoutes.get("/cms/contact/all", async (c) => {
  const contacts = await prisma.cmsContact.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return c.json({ success: true, data: contacts });
});

cmsRoutes.post("/cms/contact", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user") as AuthUser;
  const body = await c.req.json();
  const { companyName, phone, address, email, instagram, facebook, twitter, threads, website, mapsUrl } = body;

  if (!companyName) {
    return c.json({ success: false, message: "Nama perusahaan wajib diisi" }, 400);
  }

  const contact = await prisma.cmsContact.create({
    data: {
      companyName: sanitizeText(companyName) || companyName,
      phone: phone || null,
      address: address ? (sanitizeText(address) || address) : null,
      email: email || null,
      instagram: instagram || null,
      facebook: facebook || null,
      twitter: twitter || null,
      threads: threads || null,
      website: website || null,
      mapsUrl: mapsUrl || null,
      isActive: true,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_BANNER_CREATE,
    resourceName: "CmsContact",
    resourceId: contact.id,
    afterData: { companyName: contact.companyName },
  });

  return c.json({ success: true, message: "Data kontak berhasil dibuat", data: contact }, 201);
});

cmsRoutes.put("/cms/contact/:id", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user") as AuthUser;
  const id = c.req.param("id") as string;
  const body = await c.req.json();
  const { companyName, phone, address, email, instagram, facebook, twitter, threads, website, mapsUrl, isActive } = body;

  const existing = await prisma.cmsContact.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ success: false, message: "Data kontak tidak ditemukan" }, 404);
  }

  const updated = await prisma.cmsContact.update({
    where: { id },
    data: {
      ...(companyName !== undefined && { companyName: sanitizeText(companyName) || companyName }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(address !== undefined && { address: address ? (sanitizeText(address) || address) : null }),
      ...(email !== undefined && { email: email || null }),
      ...(instagram !== undefined && { instagram: instagram || null }),
      ...(facebook !== undefined && { facebook: facebook || null }),
      ...(twitter !== undefined && { twitter: twitter || null }),
      ...(threads !== undefined && { threads: threads || null }),
      ...(website !== undefined && { website: website || null }),
      ...(mapsUrl !== undefined && { mapsUrl: mapsUrl || null }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_BANNER_UPDATE,
    resourceName: "CmsContact",
    resourceId: id,
    beforeData: { companyName: existing.companyName },
    afterData: { companyName: updated.companyName },
  });

  return c.json({ success: true, message: "Data kontak berhasil diupdate", data: updated });
});

cmsRoutes.delete("/cms/contact/:id", requireSuperAdmin(), async (c) => {
  const authUser = c.get("user") as AuthUser;
  const id = c.req.param("id") as string;

  const existing = await prisma.cmsContact.findUnique({ where: { id } });
  if (!existing) {
    return c.json({ success: false, message: "Data kontak tidak ditemukan" }, 404);
  }

  await prisma.cmsContact.delete({ where: { id } });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.CMS_BANNER_DELETE,
    resourceName: "CmsContact",
    resourceId: id,
    beforeData: { companyName: existing.companyName },
  });

  return c.json({ success: true, message: "Data kontak berhasil dihapus" });
});
