import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import { createCollaborationSchema, createNetworkRequestSchema, collaborationActionSchema, networkActionSchema } from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { requireCommunityAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";

type Env = { Variables: { user: { id: string }; validated: any } };
export const relationshipRoutes = new Hono<Env>();

async function notifyOwners(communityId: string, title: string, message: string, link: string) {
  const owners = await prisma.communityMember.findMany({ where: { communityId, role: { in: ["OWNER", "ADMIN"] }, status: "ACTIVE", deletedAt: null }, select: { userId: true } });
  if (owners.length) await prisma.notification.createMany({ data: owners.map(({ userId }) => ({ userId, title, message, type: "COMMUNITY" as const, link })) });
}

relationshipRoutes.get("/communities/:communityId/network", authMiddleware, async (c) => {
  const communityId = c.req.param("communityId") as string;
  const user = c.get("user");
  const membership = await prisma.communityMember.findUnique({ where: { communityId_userId: { communityId, userId: user.id as string } } });
  if (!membership || membership.status !== "ACTIVE" || membership.deletedAt) throw new Error("Forbidden");
  const relationships = await prisma.communityNetworkRelationship.findMany({
    where: { OR: [{ requesterId: communityId }, { targetId: communityId }], status: { in: ["REQUESTED", "ACCEPTED"] } },
    include: { requester: { select: { id: true, name: true, slug: true, logo: true } }, target: { select: { id: true, name: true, slug: true, logo: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return c.json({ success: true, data: relationships });
});

relationshipRoutes.post("/communities/:communityId/network", authMiddleware, requireCommunityAdmin, validate(createNetworkRequestSchema), async (c) => {
  const requesterId = c.req.param("communityId") as string;
  const targetId = c.get("validated").targetCommunityId as string;
  if (requesterId === targetId) return c.json({ success: false, error: { code: "INVALID_TARGET", message: "Community tidak dapat terhubung dengan dirinya sendiri" } }, 400);
  const target = await prisma.community.findFirst({ where: { id: targetId, status: "APPROVED", deletedAt: null } });
  if (!target) throw new Error("Not Found");
  const existing = await prisma.communityNetworkRelationship.findFirst({ where: { OR: [{ requesterId, targetId }, { requesterId: targetId, targetId: requesterId }] } });
  if (existing && existing.status !== "REMOVED" && existing.status !== "DECLINED") return c.json({ success: false, error: { code: "DUPLICATE", message: "Permintaan network sudah ada" } }, 409);
  const relationship = existing
    ? await prisma.communityNetworkRelationship.update({ where: { id: existing.id }, data: { requesterId, targetId, status: "REQUESTED" } })
    : await prisma.communityNetworkRelationship.create({ data: { requesterId, targetId } });
  const user = c.get("user");
  await createAuditLog({ userId: user.id, actionType: AuditActions.COMMUNITY_NETWORK_REQUEST, resourceName: "CommunityNetworkRelationship", resourceId: relationship.id, afterData: { requesterId, targetId } });
  await notifyOwners(targetId, "Permintaan network komunitas", "Komunitas Anda menerima permintaan network baru.", "/dashboard/communities");
  return c.json({ success: true, data: relationship }, 201);
});

relationshipRoutes.patch("/communities/:communityId/network/:relationshipId", authMiddleware, validate(networkActionSchema), async (c) => {
  const communityId = c.req.param("communityId");
  const relationship = await prisma.communityNetworkRelationship.findUnique({ where: { id: c.req.param("relationshipId") } });
  if (!relationship || (relationship.requesterId !== communityId && relationship.targetId !== communityId)) throw new Error("Not Found");
  await requireCommunityAdmin(c, async () => undefined);
  const action = c.get("validated").action as string;
  const status = action === "accept" ? "ACCEPTED" : action === "decline" ? "DECLINED" : "REMOVED";
  const updated = await prisma.communityNetworkRelationship.update({ where: { id: relationship.id }, data: { status } });
  const user = c.get("user");
  await createAuditLog({ userId: user.id, actionType: AuditActions.COMMUNITY_NETWORK_ACTION, resourceName: "CommunityNetworkRelationship", resourceId: updated.id, beforeData: { status: relationship.status }, afterData: { status } });
  if (action === "accept") await notifyOwners(relationship.requesterId, "Network komunitas diterima", "Permintaan network komunitas Anda diterima.", "/network");
  return c.json({ success: true, data: updated });
});

relationshipRoutes.get("/collaborations", authMiddleware, async (c) => {
  const user = c.get("user");
  const memberships = await prisma.communityMember.findMany({ where: { userId: user.id, status: "ACTIVE", deletedAt: null }, select: { communityId: true } });
  const ids = memberships.map((m) => m.communityId);
  const collaborations = await prisma.collaboration.findMany({ where: { OR: [{ communityAId: { in: ids } }, { communityBId: { in: ids } }], status: { not: "CANCELLED" } }, include: { communityA: { select: { id: true, name: true, slug: true } }, communityB: { select: { id: true, name: true, slug: true } } }, orderBy: { updatedAt: "desc" } });
  return c.json({ success: true, data: collaborations });
});

relationshipRoutes.get("/collaborations/public", optionalAuthMiddleware, async (c) => {
  const collaborations = await prisma.collaboration.findMany({
    where: { status: "ACTIVE" },
    include: {
      communityA: { select: { id: true, name: true, slug: true, logo: true } },
      communityB: { select: { id: true, name: true, slug: true, logo: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return c.json({ success: true, data: collaborations });
});

relationshipRoutes.post("/collaborations", authMiddleware, validate(createCollaborationSchema), async (c) => {
  const data = c.get("validated");
  const communityAId = data.communityAId as string;
  const creatorMembership = await prisma.communityMember.findUnique({ where: { communityId_userId: { communityId: communityAId, userId: c.get("user").id } } });
  if (!creatorMembership || !["OWNER", "ADMIN"].includes(creatorMembership.role) || creatorMembership.status !== "ACTIVE" || creatorMembership.deletedAt) throw new Error("Forbidden");
  if (communityAId === data.communityBId) return c.json({ success: false, error: { code: "INVALID_TARGET", message: "Komunitas tidak dapat berkolaborasi dengan dirinya sendiri" } }, 400);
  const target = await prisma.community.findFirst({ where: { id: data.communityBId, status: "APPROVED", deletedAt: null } });
  if (!target) throw new Error("Not Found");
  const network = await prisma.communityNetworkRelationship.findFirst({ where: { OR: [{ requesterId: communityAId, targetId: data.communityBId }, { requesterId: data.communityBId, targetId: communityAId }], status: "ACCEPTED" } });
  if (!network) return c.json({ success: false, error: { code: "NETWORK_REQUIRED", message: "Terima hubungan network sebelum membuat kolaborasi" } }, 409);
  const collaboration = await prisma.collaboration.create({ data: { ...data, communityAId, createdById: c.get("user").id } });
  await createAuditLog({ userId: c.get("user").id, actionType: AuditActions.COLLABORATION_CREATE, resourceName: "Collaboration", resourceId: collaboration.id, afterData: { communityAId, communityBId: data.communityBId } });
  await notifyOwners(data.communityBId, "Undangan kolaborasi", `Undangan kolaborasi "${data.title}" menunggu respons.`, "/kolaborasi");
  return c.json({ success: true, data: collaboration }, 201);
});

relationshipRoutes.patch("/collaborations/:collaborationId", authMiddleware, validate(collaborationActionSchema), async (c) => {
  const collaboration = await prisma.collaboration.findUnique({ where: { id: c.req.param("collaborationId") } });
  if (!collaboration) throw new Error("Not Found");
  const action = c.get("validated").action as string;
  const communityId = action === "accept" || action === "reject" ? collaboration.communityBId : collaboration.communityAId;
  const membership = await prisma.communityMember.findUnique({ where: { communityId_userId: { communityId, userId: c.get("user").id } } });
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role) || membership.status !== "ACTIVE" || membership.deletedAt) throw new Error("Forbidden");
  const status = action === "accept" ? "ACTIVE" : action === "reject" ? "CANCELLED" : action === "complete" ? "COMPLETED" : "CANCELLED";
  const updated = await prisma.collaboration.update({ where: { id: collaboration.id }, data: { status } });
  await createAuditLog({ userId: c.get("user").id, actionType: AuditActions.COLLABORATION_STATUS, resourceName: "Collaboration", resourceId: updated.id, beforeData: { status: collaboration.status }, afterData: { status } });
  return c.json({ success: true, data: updated });
});
