import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import type { AuthUser } from "../../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };
export const rolesRoutes = new Hono<Env>();

function pagination(url: string) {
  const u = new URL(url);
  const page = Math.max(1, parseInt(u.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(u.searchParams.get("limit") || "20")));
  const search = u.searchParams.get("search") || "";
  const sortBy = u.searchParams.get("sortBy") || "createdAt";
  const sortOrder = u.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  return { page, limit, search, sortBy, sortOrder, skip: (page - 1) * limit };
}

rolesRoutes.get("/roles", async (c) => {
  const { page, limit, search, skip } = pagination(c.req.url);
  const url = new URL(c.req.url);
  const roleType = url.searchParams.get("type") || "";

  const where: Record<string, any> = {};

  if (search) {
    where.user = {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ],
    };
  }

  if (roleType) {
    where.role = roleType;
  }

  const [roles, total] = await Promise.all([
    prisma.userRole.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userRole.count({ where }),
  ]);

  return c.json({
    success: true,
    data: roles.map((r) => ({
      id: r.id,
      role: r.role,
      user: r.user,
      createdAt: r.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
