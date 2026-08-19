import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import {
  createVolunteerOpportunitySchema,
  updateVolunteerOpportunitySchema,
  volunteerOpportunityQuerySchema,
  applyVolunteerSchema,
  reviewVolunteerApplicationSchema,
  assignVolunteerSchema,
} from "@komunaid/shared";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAuditLog, AuditActions } from "../services/audit";
import { xssSanitize, sanitizeText } from "../lib/xss";
import { slugify } from "@komunaid/utils";
import type { AuthUser } from "../middleware/auth";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const volunteerRoutes = new Hono<Env>();

async function getEventOrganizerRole(userId: string, event: any): Promise<string | null> {
  if (event.communityId) {
    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: event.communityId, userId } },
    });
    return membership?.status === "ACTIVE" && membership.deletedAt === null ? membership.role : null;
  }
  if (event.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: event.organizationId, userId } },
    });
    return membership?.status === "ACTIVE" && membership.deletedAt === null ? membership.role : null;
  }
  return null;
}

function canManageEvent(role: string | null, userId: string, event: any): boolean {
  if (!role) return false;
  if (event.createdById === userId) return true;
  if (["OWNER", "ADMIN", "EVENT_MANAGER"].includes(role)) return true;
  return false;
}

const VALID_OPPORTUNITY_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["OPEN"],
  OPEN: ["CLOSED"],
  CLOSED: ["ARCHIVED"],
  ARCHIVED: [],
};

function isValidOpportunityTransition(from: string, to: string): boolean {
  return VALID_OPPORTUNITY_TRANSITIONS[from]?.includes(to) ?? false;
}

// ==========================================
// 1. LIST VOLUNTEER OPPORTUNITIES (Public)
// ==========================================

volunteerRoutes.get("/", optionalAuthMiddleware, validate(volunteerOpportunityQuerySchema, "query"), async (c) => {
  const q = c.get("validated");
  const page = q.page as number;
  const limit = q.limit as number;

  // Public discovery exposes opportunities only from eligible public events.
  const where: any = {
    deletedAt: null,
    status: { notIn: ["DRAFT", "ARCHIVED"] },
    event: {
      deletedAt: null,
      visibility: "PUBLIC",
      status: { notIn: ["DRAFT", "CANCELLED", "ARCHIVED"] },
    },
  };

  if (q.search) {
    where.OR = [
      { title: { contains: q.search } },
      { description: { contains: q.search } },
    ];
  }

  if (q.status && !["DRAFT", "ARCHIVED"].includes(q.status)) where.status = q.status;
  if (q.eventId) where.eventId = q.eventId;

  const orderBy: any = { [q.orderBy]: q.sort };

  const [opportunities, total] = await Promise.all([
    prisma.volunteerOpportunity.findMany({
      where,
      include: {
        event: {
          select: { id: true, title: true, slug: true, eventDate: true, location: true, status: true },
        },
        createdBy: { select: { id: true, name: true, avatar: true } },
        positions: true,
        _count: { select: { applications: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.volunteerOpportunity.count({ where }),
  ]);

  return c.json({
    success: true,
    data: opportunities.map((o) => ({
      id: o.id,
      title: o.title,
      slug: o.slug,
      description: o.description,
      status: o.status,
      registrationDeadline: o.registrationDeadline,
      briefingDate: o.briefingDate,
      activityStartDate: o.activityStartDate,
      activityEndDate: o.activityEndDate,
      event: o.event,
      createdBy: o.createdBy,
      positions: o.positions.map((p) => ({
        id: p.id,
        name: p.name,
        requiredQty: p.requiredQty,
      })),
      applicationCount: o._count.applications,
      createdAt: o.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ==========================================
// 2. MY VOLUNTEER (Member Dashboard)
// ==========================================

volunteerRoutes.get("/my/applications", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const url = new URL(c.req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
  const status = url.searchParams.get("status") || "";

  const where: any = { userId: authUser.id };

  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.volunteerApplication.findMany({
      where,
      include: {
        opportunity: {
          include: {
            event: { select: { id: true, title: true, slug: true, eventDate: true, status: true } },
          },
        },
        position: { select: { id: true, name: true } },
        assignment: {
          include: { attendance: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.volunteerApplication.count({ where }),
  ]);

  return c.json({
    success: true,
    data: applications.map((a) => ({
      id: a.id,
      status: a.status,
      motivation: a.motivation,
      experience: a.experience,
      availability: a.availability,
      reviewedAt: a.reviewedAt,
      reviewNote: a.reviewNote,
      createdAt: a.createdAt,
      opportunity: {
        id: a.opportunity.id,
        title: a.opportunity.title,
        slug: a.opportunity.slug,
        status: a.opportunity.status,
        activityStartDate: a.opportunity.activityStartDate,
        event: a.opportunity.event,
      },
      position: a.position,
      assignment: a.assignment
        ? {
            id: a.assignment.id,
            shiftStart: a.assignment.shiftStart,
            shiftEnd: a.assignment.shiftEnd,
            notes: a.assignment.notes,
            attendance: a.assignment.attendance
              ? {
                  status: a.assignment.attendance.status,
                  checkInAt: a.assignment.attendance.checkInAt,
                  checkOutAt: a.assignment.attendance.checkOutAt,
                }
              : null,
          }
        : null,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ==========================================
// 3. VOLUNTEER DASHBOARD (Organizer)
// ==========================================

volunteerRoutes.get("/dashboard/:eventId", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const eventId = c.req.param("eventId") as string;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  const [
    totalOpportunities,
    totalApplicants,
    pendingCount,
    acceptedCount,
    rejectedCount,
    checkedInCount,
    checkedOutCount,
    opportunities,
  ] = await Promise.all([
    prisma.volunteerOpportunity.count({ where: { eventId, deletedAt: null } }),
    prisma.volunteerApplication.count({
      where: { opportunity: { eventId, deletedAt: null } },
    }),
    prisma.volunteerApplication.count({
      where: { opportunity: { eventId, deletedAt: null }, status: "APPLIED" },
    }),
    prisma.volunteerApplication.count({
      where: { opportunity: { eventId, deletedAt: null }, status: "ACCEPTED" },
    }),
    prisma.volunteerApplication.count({
      where: { opportunity: { eventId, deletedAt: null }, status: "REJECTED" },
    }),
    prisma.volunteerAttendance.count({
      where: {
        assignment: { application: { opportunity: { eventId, deletedAt: null } } },
        status: "CHECKED_IN",
      },
    }),
    prisma.volunteerAttendance.count({
      where: {
        assignment: { application: { opportunity: { eventId, deletedAt: null } } },
        status: "CHECKED_OUT",
      },
    }),
    prisma.volunteerOpportunity.findMany({
      where: { eventId, deletedAt: null },
      include: {
        positions: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return c.json({
    success: true,
    data: {
      summary: {
        totalOpportunities,
        totalApplicants,
        pending: pendingCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
        checkedIn: checkedInCount,
        checkedOut: checkedOutCount,
      },
      opportunities: opportunities.map((o) => ({
        id: o.id,
        title: o.title,
        slug: o.slug,
        status: o.status,
        positions: o.positions.map((p) => ({
          id: p.id,
          name: p.name,
          requiredQty: p.requiredQty,
        })),
        applicationCount: o._count.applications,
        createdAt: o.createdAt,
      })),
    },
  });
});

// ==========================================
// 4. GET OPPORTUNITY BY SLUG
// ==========================================

volunteerRoutes.get("/detail/:slug", optionalAuthMiddleware, async (c) => {
  const slug = c.req.param("slug") as string;
  const user = c.get("user");

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { slug },
    include: {
      event: {
        select: {
          id: true, title: true, slug: true, eventDate: true, endDate: true,
          location: true, locationType: true, status: true, visibility: true, createdById: true, communityId: true, organizationId: true, deletedAt: true,
          community: { select: { id: true, name: true, slug: true } },
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
      createdBy: { select: { id: true, name: true, avatar: true } },
      positions: true,
      _count: { select: { applications: true } },
    },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  const organizerRole = user ? await getEventOrganizerRole(user.id, opportunity.event) : null;
  const isOrganizer = user ? canManageEvent(organizerRole, user.id, opportunity.event) : false;
  const isPublicOpportunity =
    !["DRAFT", "ARCHIVED"].includes(opportunity.status) &&
    opportunity.event.visibility === "PUBLIC" &&
    !["DRAFT", "CANCELLED", "ARCHIVED"].includes(opportunity.event.status);
  if (!isPublicOpportunity && !isOrganizer) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  let userApplication = null;
  if (user) {
    userApplication = await prisma.volunteerApplication.findUnique({
      where: { opportunityId_userId: { opportunityId: opportunity.id, userId: user.id } },
      include: {
        position: { select: { id: true, name: true } },
        assignment: { include: { attendance: true } },
      },
    });
  }

  const positionApplications = await prisma.volunteerPosition.findMany({
    where: { opportunityId: opportunity.id },
    select: {
      id: true,
      name: true,
      description: true,
      requiredQty: true,
      requirement: true,
      _count: {
        select: {
          applications: { where: { status: { in: ["APPLIED", "ACCEPTED"] } } },
        },
      },
    },
  });

  return c.json({
    success: true,
    data: {
      ...opportunity,
      positions: positionApplications.map((p) => ({
        ...p,
        remainingSlot: p.requiredQty - p._count.applications,
        applicationCount: p._count.applications,
        _count: undefined,
      })),
      applicationCount: opportunity._count.applications,
      userApplication: userApplication
        ? {
            id: userApplication.id,
            status: userApplication.status,
            position: userApplication.position,
            assignment: userApplication.assignment
              ? {
                  id: userApplication.assignment.id,
                  shiftStart: userApplication.assignment.shiftStart,
                  shiftEnd: userApplication.assignment.shiftEnd,
                  notes: userApplication.assignment.notes,
                  attendance: userApplication.assignment.attendance,
                }
              : null,
          }
        : null,
    },
  });
});

// ==========================================
// 5. CREATE VOLUNTEER OPPORTUNITY
// ==========================================

volunteerRoutes.post("/", authMiddleware, validate(createVolunteerOpportunitySchema), async (c) => {
  const authUser = c.get("user");
  const data = c.get("validated");

  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event || event.deletedAt) {
    return c.json({ success: false, message: "Event tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, event);
  if (!canManageEvent(role, authUser.id, event)) {
    return c.json({ success: false, message: "Tidak memiliki akses membuat volunteer opportunity" }, 403);
  }

  let slug = slugify(data.title);
  const existingSlug = await prisma.volunteerOpportunity.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Date.now()}`;

  const { positions, ...opportunityData } = data;

  const sanitizedOpportunityData = {
    ...opportunityData,
    title: sanitizeText(opportunityData.title),
    description: sanitizeText(opportunityData.description),
    contactEmail: sanitizeText(opportunityData.contactEmail),
  };

  const opportunity = await prisma.volunteerOpportunity.create({
    data: {
      ...sanitizedOpportunityData,
      slug,
      createdById: authUser.id,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      briefingDate: data.briefingDate ? new Date(data.briefingDate) : null,
      activityStartDate: data.activityStartDate ? new Date(data.activityStartDate) : null,
      activityEndDate: data.activityEndDate ? new Date(data.activityEndDate) : null,
      positions: {
        create: positions.map((p: any) => ({
          name: p.name,
          description: p.description,
          requiredQty: p.requiredQty,
          requirement: p.requirement,
        })),
      },
    },
    include: {
      positions: true,
      event: { select: { id: true, title: true, slug: true } },
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_OPPORTUNITY_CREATE,
    resourceName: "VolunteerOpportunity",
    resourceId: opportunity.id,
    afterData: { title: opportunity.title, slug: opportunity.slug, eventId: event.id },
  });

  return c.json({
    success: true,
    message: "Volunteer opportunity berhasil dibuat",
    data: {
      id: opportunity.id,
      title: opportunity.title,
      slug: opportunity.slug,
      status: opportunity.status,
      event: opportunity.event,
      positions: opportunity.positions,
    },
  }, 201);
});

// ==========================================
// 6. UPDATE VOLUNTEER OPPORTUNITY
// ==========================================

volunteerRoutes.patch("/:opportunityId", authMiddleware, validate(updateVolunteerOpportunitySchema), async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;
  const data = c.get("validated");

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: { event: true },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, opportunity.event);
  if (!canManageEvent(role, authUser.id, opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mengubah opportunity ini" }, 403);
  }

  if (["CLOSED", "ARCHIVED"].includes(opportunity.status)) {
    return c.json({ success: false, message: "Opportunity yang sudah ditutup/diarsipkan tidak dapat diubah" }, 400);
  }

  const { positions, ...updateData } = data;

  const sanitizedUpdateData = {
    ...updateData,
    title: sanitizeText(updateData.title),
    description: sanitizeText(updateData.description),
    contactEmail: sanitizeText(updateData.contactEmail),
  };

  const existingPositionIds = positions?.flatMap((pos: { id?: string }) => pos.id ? [pos.id] : []) ?? [];
  if (existingPositionIds.length > 0) {
    const scopedPositions = await prisma.volunteerPosition.findMany({
      where: { id: { in: existingPositionIds }, opportunityId },
      select: { id: true },
    });
    if (scopedPositions.length !== existingPositionIds.length) {
      return c.json({ success: false, message: "Posisi volunteer tidak ditemukan" }, 404);
    }
  }

  const updated = await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: {
      ...sanitizedUpdateData,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined,
      briefingDate: data.briefingDate ? new Date(data.briefingDate) : undefined,
      activityStartDate: data.activityStartDate ? new Date(data.activityStartDate) : undefined,
      activityEndDate: data.activityEndDate ? new Date(data.activityEndDate) : undefined,
    },
    include: { positions: true },
  });

  if (positions) {
    for (const pos of positions) {
      if (pos.id) {
        const result = await prisma.volunteerPosition.updateMany({
          where: { id: pos.id, opportunityId },
          data: {
            name: pos.name,
            description: pos.description,
            requiredQty: pos.requiredQty,
            requirement: pos.requirement,
          },
        });
        if (result.count !== 1) throw new Error("Posisi volunteer tidak ditemukan");
      } else {
        await prisma.volunteerPosition.create({
          data: {
            opportunityId,
            name: pos.name,
            description: pos.description,
            requiredQty: pos.requiredQty,
            requirement: pos.requirement,
          },
        });
      }
    }
  }

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_OPPORTUNITY_UPDATE,
    resourceName: "VolunteerOpportunity",
    resourceId: opportunityId,
    beforeData: { title: opportunity.title },
    afterData: { title: updated.title },
  });

  const refreshedPositions = await prisma.volunteerPosition.findMany({
    where: { opportunityId },
  });

  return c.json({
    success: true,
    message: "Volunteer opportunity berhasil diperbarui",
    data: {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      status: updated.status,
      positions: refreshedPositions,
    },
  });
});

// ==========================================
// 7. DELETE VOLUNTEER OPPORTUNITY (Soft Delete)
// ==========================================

volunteerRoutes.delete("/:opportunityId", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: {
      event: true,
      _count: { select: { applications: true } },
    },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  if (opportunity._count.applications > 0) {
    return c.json(
      {
        success: false,
        message: "Tidak dapat menghapus opportunity yang masih memiliki pendaftaran aktif",
      },
      400
    );
  }

  const role = await getEventOrganizerRole(authUser.id, opportunity.event);
  if (!canManageEvent(role, authUser.id, opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses menghapus opportunity ini" }, 403);
  }

  await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_OPPORTUNITY_DELETE,
    resourceName: "VolunteerOpportunity",
    resourceId: opportunityId,
    beforeData: { title: opportunity.title, status: opportunity.status },
  });

  return c.json({ success: true, message: "Volunteer opportunity berhasil dihapus" });
});

// ==========================================
// 8. PUBLISH VOLUNTEER OPPORTUNITY
// ==========================================

volunteerRoutes.post("/:opportunityId/publish", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: { event: true },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, opportunity.event);
  if (!canManageEvent(role, authUser.id, opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mempublikasikan opportunity ini" }, 403);
  }

  const targetStatus = "PUBLISHED";
  if (!isValidOpportunityTransition(opportunity.status, targetStatus)) {
    return c.json({ success: false, message: `Tidak dapat publish dari status ${opportunity.status}` }, 400);
  }

  const updated = await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: { status: targetStatus },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_OPPORTUNITY_PUBLISH,
    resourceName: "VolunteerOpportunity",
    resourceId: opportunityId,
    beforeData: { status: opportunity.status },
    afterData: { status: targetStatus },
  });

  return c.json({
    success: true,
    message: "Volunteer opportunity berhasil dipublikasikan",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 9. CLOSE VOLUNTEER OPPORTUNITY
// ==========================================

volunteerRoutes.post("/:opportunityId/close", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: { event: true },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, opportunity.event);
  if (!canManageEvent(role, authUser.id, opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses menutup opportunity ini" }, 403);
  }

  if (!isValidOpportunityTransition(opportunity.status, "CLOSED")) {
    return c.json({ success: false, message: `Tidak dapat menutup dari status ${opportunity.status}` }, 400);
  }

  const updated = await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: { status: "CLOSED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_OPPORTUNITY_CLOSE,
    resourceName: "VolunteerOpportunity",
    resourceId: opportunityId,
    beforeData: { status: opportunity.status },
    afterData: { status: "CLOSED" },
  });

  return c.json({
    success: true,
    message: "Volunteer opportunity berhasil ditutup",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 10. ARCHIVE VOLUNTEER OPPORTUNITY
// ==========================================

volunteerRoutes.post("/:opportunityId/archive", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: { event: true },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, opportunity.event);
  if (!canManageEvent(role, authUser.id, opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses mengarsipkan opportunity ini" }, 403);
  }

  if (!isValidOpportunityTransition(opportunity.status, "ARCHIVED")) {
    return c.json({ success: false, message: `Tidak dapat mengarsipkan dari status ${opportunity.status}` }, 400);
  }

  const updated = await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: { status: "ARCHIVED" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_OPPORTUNITY_ARCHIVE,
    resourceName: "VolunteerOpportunity",
    resourceId: opportunityId,
    beforeData: { status: opportunity.status },
    afterData: { status: "ARCHIVED" },
  });

  return c.json({
    success: true,
    message: "Volunteer opportunity berhasil diarsipkan",
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 11. APPLY FOR VOLUNTEER
// ==========================================

volunteerRoutes.post("/:opportunityId/apply", authMiddleware, validate(applyVolunteerSchema), async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;
  const data = c.get("validated");

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: { event: true },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  if (!["PUBLISHED", "OPEN"].includes(opportunity.status)) {
    return c.json({ success: false, message: "Volunteer opportunity belum dibuka" }, 400);
  }

  if (opportunity.registrationDeadline && new Date() > new Date(opportunity.registrationDeadline)) {
    return c.json({ success: false, message: "Batas pendaftaran sudah lewat" }, 400);
  }

  const position = await prisma.volunteerPosition.findUnique({
    where: { id: data.positionId },
    include: {
      _count: {
        select: {
          applications: { where: { status: { in: ["APPLIED", "ACCEPTED"] } } },
        },
      },
    },
  });

  if (!position || position.opportunityId !== opportunityId) {
    return c.json({ success: false, message: "Posisi tidak ditemukan" }, 404);
  }

  if (position._count.applications >= position.requiredQty) {
    return c.json({ success: false, message: "Kuota posisi ini sudah penuh" }, 400);
  }

  const existingApplication = await prisma.volunteerApplication.findUnique({
    where: { opportunityId_userId: { opportunityId, userId: authUser.id } },
  });

  if (existingApplication && ["APPLIED", "ACCEPTED"].includes(existingApplication.status)) {
    return c.json({ success: false, message: "Sudah mendaftar di opportunity ini" }, 409);
  }

  if (existingApplication) {
    await prisma.volunteerApplication.delete({ where: { id: existingApplication.id } });
  }

  const application = await prisma.volunteerApplication.create({
    data: {
      opportunityId,
      positionId: data.positionId,
      userId: authUser.id,
      motivation: data.motivation,
      experience: data.experience,
      availability: data.availability,
      agreement: data.agreement,
    },
    include: {
      position: { select: { id: true, name: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: opportunity.createdById,
      title: "Volunteer Baru Mendaftar",
      message: `${authUser.name} mendaftar sebagai volunteer pada "${opportunity.title}"`,
      type: "EVENT",
      link: `/volunteer/${opportunity.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_APPLY,
    resourceName: "VolunteerApplication",
    resourceId: application.id,
    afterData: { opportunityId, positionId: data.positionId, positionName: position.name },
  });

  return c.json({
    success: true,
    message: "Berhasil mendaftar sebagai volunteer",
    data: {
      id: application.id,
      status: application.status,
      position: application.position,
    },
  }, 201);
});

// ==========================================
// 12. CANCEL VOLUNTEER APPLICATION
// ==========================================

volunteerRoutes.delete("/:opportunityId/apply", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  if (["CLOSED", "ARCHIVED"].includes(opportunity.status)) {
    return c.json({ success: false, message: "Tidak dapat membatalkan pendaftaran" }, 400);
  }

  const application = await prisma.volunteerApplication.findUnique({
    where: { opportunityId_userId: { opportunityId, userId: authUser.id } },
    include: { assignment: true },
  });

  if (!application || !["APPLIED", "REVIEWED"].includes(application.status)) {
    return c.json({ success: false, message: "Tidak ada pendaftaran aktif" }, 404);
  }

  if (application.assignment) {
    return c.json({ success: false, message: "Tidak dapat membatalkan karena sudah ditugaskan" }, 400);
  }

  await prisma.volunteerApplication.delete({ where: { id: application.id } });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_CANCEL_APPLICATION,
    resourceName: "VolunteerApplication",
    resourceId: application.id,
    afterData: { opportunityId, positionId: application.positionId },
  });

  return c.json({ success: true, message: "Berhasil membatalkan pendaftaran volunteer" });
});

// ==========================================
// 13. GET APPLICATIONS (Organizer)
// ==========================================

volunteerRoutes.get("/:opportunityId/applications", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const opportunityId = c.req.param("opportunityId") as string;
  const url = new URL(c.req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
  const status = url.searchParams.get("status") || "";
  const positionId = url.searchParams.get("positionId") || "";

  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: { event: true },
  });

  if (!opportunity || opportunity.deletedAt) {
    return c.json({ success: false, message: "Volunteer opportunity tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, opportunity.event);
  if (!canManageEvent(role, authUser.id, opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses melihat pendaftar" }, 403);
  }

  const where: any = { opportunityId };
  if (status) where.status = status;
  if (positionId) where.positionId = positionId;

  const [applications, total] = await Promise.all([
    prisma.volunteerApplication.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
        position: { select: { id: true, name: true } },
        assignment: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.volunteerApplication.count({ where }),
  ]);

  const stats = await prisma.volunteerApplication.groupBy({
    by: ["status"],
    where: { opportunityId },
    _count: true,
  });

  return c.json({
    success: true,
    data: applications.map((a) => ({
      id: a.id,
      user: a.user,
      position: a.position,
      motivation: a.motivation,
      experience: a.experience,
      availability: a.availability,
      status: a.status,
      reviewedAt: a.reviewedAt,
      reviewNote: a.reviewNote,
      assignment: a.assignment,
      createdAt: a.createdAt,
    })),
    stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ==========================================
// 14. ACCEPT APPLICATION
// ==========================================

volunteerRoutes.patch("/applications/:applicationId/accept", authMiddleware, validate(reviewVolunteerApplicationSchema), async (c) => {
  const authUser = c.get("user");
  const applicationId = c.req.param("applicationId") as string;
  const data = c.get("validated");

  if (data.action !== "ACCEPTED") {
    return c.json({ success: false, message: "Gunakan endpoint reject untuk menolak" }, 400);
  }

  const application = await prisma.volunteerApplication.findUnique({
    where: { id: applicationId },
    include: {
      opportunity: { include: { event: true } },
      user: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
    },
  });

  if (!application) {
    return c.json({ success: false, message: "Pendaftaran tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, application.opportunity.event);
  if (!canManageEvent(role, authUser.id, application.opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (application.status !== "APPLIED") {
    return c.json({ success: false, message: "Hanya pendaftaran dengan status APPLIED yang dapat diterima" }, 400);
  }

  const positionSlot = await prisma.volunteerPosition.findUnique({
    where: { id: application.positionId },
    include: {
      _count: {
        select: {
          applications: { where: { status: { in: ["APPLIED", "ACCEPTED"] } } },
        },
      },
    },
  });

  if (positionSlot && positionSlot._count.applications >= positionSlot.requiredQty) {
    return c.json({ success: false, message: "Kuota posisi sudah penuh" }, 400);
  }

  const updated = await prisma.volunteerApplication.update({
    where: { id: applicationId },
    data: {
      status: "ACCEPTED",
      reviewedAt: new Date(),
      reviewedById: authUser.id,
      reviewNote: data.reviewNote,
    },
  });

  await prisma.notification.create({
    data: {
      userId: application.userId,
      title: "Volunteer Diterima",
      message: `Pendaftaran Anda sebagai volunteer "${application.opportunity.title}" posisi "${application.position.name}" telah diterima.`,
      type: "EVENT",
      link: `/volunteer/${application.opportunity.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_ACCEPT,
    resourceName: "VolunteerApplication",
    resourceId: applicationId,
    beforeData: { status: application.status },
    afterData: { status: "ACCEPTED" },
  });

  return c.json({
    success: true,
    message: `Pendaftaran ${application.user.name} berhasil diterima`,
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 15. REJECT APPLICATION
// ==========================================

volunteerRoutes.patch("/applications/:applicationId/reject", authMiddleware, validate(reviewVolunteerApplicationSchema), async (c) => {
  const authUser = c.get("user");
  const applicationId = c.req.param("applicationId") as string;
  const data = c.get("validated");

  if (data.action !== "REJECTED") {
    return c.json({ success: false, message: "Gunakan endpoint accept untuk menerima" }, 400);
  }

  const application = await prisma.volunteerApplication.findUnique({
    where: { id: applicationId },
    include: {
      opportunity: { include: { event: true } },
      user: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
    },
  });

  if (!application) {
    return c.json({ success: false, message: "Pendaftaran tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, application.opportunity.event);
  if (!canManageEvent(role, authUser.id, application.opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (application.status !== "APPLIED") {
    return c.json({ success: false, message: "Hanya pendaftaran dengan status APPLIED yang dapat ditolak" }, 400);
  }

  const updated = await prisma.volunteerApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: authUser.id,
      reviewNote: data.reviewNote,
    },
  });

  await prisma.notification.create({
    data: {
      userId: application.userId,
      title: "Volunteer Ditolak",
      message: `Pendaftaran Anda sebagai volunteer "${application.opportunity.title}" posisi "${application.position.name}" telah ditolak.`,
      type: "EVENT",
      link: `/volunteer/${application.opportunity.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_REJECT,
    resourceName: "VolunteerApplication",
    resourceId: applicationId,
    beforeData: { status: application.status },
    afterData: { status: "REJECTED" },
  });

  return c.json({
    success: true,
    message: `Pendaftaran ${application.user.name} berhasil ditolak`,
    data: { id: updated.id, status: updated.status },
  });
});

// ==========================================
// 16. ASSIGN VOLUNTEER
// ==========================================

volunteerRoutes.patch("/applications/:applicationId/assign", authMiddleware, validate(assignVolunteerSchema), async (c) => {
  const authUser = c.get("user");
  const applicationId = c.req.param("applicationId") as string;
  const data = c.get("validated");

  const application = await prisma.volunteerApplication.findUnique({
    where: { id: applicationId },
    include: {
      opportunity: { include: { event: true } },
      user: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
      assignment: true,
    },
  });

  if (!application) {
    return c.json({ success: false, message: "Pendaftaran tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, application.opportunity.event);
  if (!canManageEvent(role, authUser.id, application.opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (application.status !== "ACCEPTED") {
    return c.json({ success: false, message: "Hanya pendaftaran yang diterima yang dapat ditugaskan" }, 400);
  }

  if (application.assignment) {
    return c.json({ success: false, message: "Sudah ditugaskan sebelumnya" }, 409);
  }

  if (data.picUserId) {
    const picUser = await prisma.user.findUnique({ where: { id: data.picUserId } });
    if (!picUser) {
      return c.json({ success: false, message: "PIC user tidak ditemukan" }, 404);
    }
  }

  const assignment = await prisma.volunteerAssignment.create({
    data: {
      applicationId,
      positionId: application.positionId,
      picUserId: data.picUserId,
      shiftStart: data.shiftStart ? new Date(data.shiftStart) : null,
      shiftEnd: data.shiftEnd ? new Date(data.shiftEnd) : null,
      notes: data.notes,
    },
    include: {
      application: { select: { id: true, userId: true } },
    },
  });

  await prisma.volunteerAttendance.create({
    data: { assignmentId: assignment.id },
  });

  await prisma.notification.create({
    data: {
      userId: application.userId,
      title: "Volunteer Ditugaskan",
      message: `Anda ditugaskan sebagai volunteer posisi "${application.position.name}" pada "${application.opportunity.title}".`,
      type: "EVENT",
      link: `/volunteer/${application.opportunity.slug}`,
    },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_ASSIGN,
    resourceName: "VolunteerAssignment",
    resourceId: assignment.id,
    afterData: {
      applicationId,
      volunteerUserId: application.userId,
      positionName: application.position.name,
      picUserId: data.picUserId,
    },
  });

  return c.json({
    success: true,
    message: "Volunteer berhasil ditugaskan",
    data: {
      id: assignment.id,
      applicationId: assignment.applicationId,
      positionId: assignment.positionId,
      picUserId: assignment.picUserId,
      shiftStart: assignment.shiftStart,
      shiftEnd: assignment.shiftEnd,
      notes: assignment.notes,
    },
  });
});

// ==========================================
// 17. CHECK IN VOLUNTEER
// ==========================================

volunteerRoutes.patch("/attendance/:assignmentId/check-in", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const assignmentId = c.req.param("assignmentId") as string;

  const assignment = await prisma.volunteerAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      application: {
        include: {
          opportunity: { include: { event: true } },
          user: { select: { id: true, name: true } },
          position: { select: { id: true, name: true } },
        },
      },
      attendance: true,
    },
  });

  if (!assignment) {
    return c.json({ success: false, message: "Penugasan tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, assignment.application.opportunity.event);
  if (!canManageEvent(role, authUser.id, assignment.application.opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!assignment.attendance) {
    return c.json({ success: false, message: "Data attendance tidak ditemukan" }, 404);
  }

  if (assignment.attendance.status !== "NOT_CHECKED_IN") {
    return c.json({ success: false, message: "Sudah check in sebelumnya" }, 400);
  }

  const updated = await prisma.volunteerAttendance.update({
    where: { assignmentId },
    data: { checkInAt: new Date(), status: "CHECKED_IN" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_CHECK_IN,
    resourceName: "VolunteerAttendance",
    resourceId: assignmentId,
    afterData: { volunteerUserId: assignment.application.userId, userName: assignment.application.user.name },
  });

  return c.json({
    success: true,
    message: `${assignment.application.user.name} berhasil check in`,
    data: {
      assignmentId,
      status: updated.status,
      checkInAt: updated.checkInAt,
    },
  });
});

// ==========================================
// 18. CHECK OUT VOLUNTEER
// ==========================================

volunteerRoutes.patch("/attendance/:assignmentId/check-out", authMiddleware, async (c) => {
  const authUser = c.get("user");
  const assignmentId = c.req.param("assignmentId") as string;

  const assignment = await prisma.volunteerAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      application: {
        include: {
          opportunity: { include: { event: true } },
          user: { select: { id: true, name: true } },
          position: { select: { id: true, name: true } },
        },
      },
      attendance: true,
    },
  });

  if (!assignment) {
    return c.json({ success: false, message: "Penugasan tidak ditemukan" }, 404);
  }

  const role = await getEventOrganizerRole(authUser.id, assignment.application.opportunity.event);
  if (!canManageEvent(role, authUser.id, assignment.application.opportunity.event)) {
    return c.json({ success: false, message: "Tidak memiliki akses" }, 403);
  }

  if (!assignment.attendance) {
    return c.json({ success: false, message: "Data attendance tidak ditemukan" }, 404);
  }

  if (assignment.attendance.status !== "CHECKED_IN") {
    return c.json({ success: false, message: "Belum check in" }, 400);
  }

  const updated = await prisma.volunteerAttendance.update({
    where: { assignmentId },
    data: { checkOutAt: new Date(), status: "CHECKED_OUT" },
  });

  await createAuditLog({
    userId: authUser.id,
    actionType: AuditActions.VOLUNTEER_CHECK_OUT,
    resourceName: "VolunteerAttendance",
    resourceId: assignmentId,
    afterData: { volunteerUserId: assignment.application.userId, userName: assignment.application.user.name },
  });

  return c.json({
    success: true,
    message: `${assignment.application.user.name} berhasil check out`,
    data: {
      assignmentId,
      status: updated.status,
      checkOutAt: updated.checkOutAt,
    },
  });
});
