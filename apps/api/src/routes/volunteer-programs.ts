import { Hono } from "hono";
import { prisma } from "@komunaid/database";
import {
  applyVolunteerProgramSchema,
  createCommunityVolunteerProgramSchema,
  createIndependentVolunteerProgramSchema,
  recordVolunteerProgramAttendanceSchema,
  reviewVolunteerProgramApplicationSchema,
  reviewVolunteerProgramSchema,
  transitionVolunteerProgramSchema,
  updateVolunteerProgramSchema,
} from "@komunaid/shared";
import { slugify } from "@komunaid/utils";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import type { AuthUser } from "../middleware/auth";
import { requireSuperAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { createAuditLog } from "../services/audit";
import { sanitizeText } from "../lib/xss";
import { createWithUniqueSlug } from "../lib/slug";
import { sendEmail } from "../services/email";
import { transitionVolunteerProgram, VOLUNTEER_PROGRAM_TRANSITIONS, VolunteerProgramTransitionError } from "../services/volunteer-program-transition";
import { VOLUNTEER_PUBLIC_STATUSES, isRegistrationOpen, registrationState } from "../services/content-lifecycle";
import { applyToVolunteerProgram, transitionVolunteerProgramApplication, VolunteerProgramApplicationError } from "../services/volunteer-program-application";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const volunteerProgramRoutes = new Hono<Env>();

const PUBLIC_STATUSES = [...VOLUNTEER_PUBLIC_STATUSES];
const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED", "ARCHIVED"];
const ORGANIZER_TRANSITIONS = new Set(["SCHEDULED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "COMPLETED", "CANCELLED", "ARCHIVED"]);

function parseDate(value: string) {
  return new Date(value);
}

function datesAreValid(data: { registrationOpensAt?: string; registrationDeadline?: string; startDate?: string; endDate?: string }, requireFutureStart = false) {
  const opensAt = data.registrationOpensAt ? parseDate(data.registrationOpensAt) : undefined;
  const startDate = data.startDate ? parseDate(data.startDate) : undefined;
  const endDate = data.endDate ? parseDate(data.endDate) : undefined;
  const deadline = data.registrationDeadline ? parseDate(data.registrationDeadline) : undefined;
  if (startDate && (Number.isNaN(startDate.getTime()) || (requireFutureStart && startDate <= new Date()))) return false;
  if (endDate && Number.isNaN(endDate.getTime())) return false;
  if (deadline && Number.isNaN(deadline.getTime())) return false;
  if (opensAt && Number.isNaN(opensAt.getTime())) return false;
  if (startDate && endDate && endDate <= startDate) return false;
  if (deadline && startDate && deadline >= startDate) return false;
  if (opensAt && deadline && opensAt >= deadline) return false;
  return true;
}

async function communityVolunteerPermission(userId: string, communityId: string) {
  const member = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
  });
  return Boolean(
    member &&
      member.status === "ACTIVE" &&
      member.deletedAt === null &&
      ["OWNER", "ADMIN", "VOLUNTEER_COORDINATOR"].includes(member.role)
  );
}

async function organizerAccess(userId: string, program: any, management: boolean) {
  if (management && TERMINAL_STATUSES.includes(program.status)) return false;
  if (program.organizerType === "COMMUNITY") {
    return program.communityId ? communityVolunteerPermission(userId, program.communityId) : false;
  }

  if (program.organizerUserId !== userId) return false;
  const access = await prisma.volunteerProgramOrganizerAccess.findUnique({
    where: { volunteerProgramId_userId: { volunteerProgramId: program.id, userId } },
  });
  if (!access) return false;
  if (!management) return true;
  const now = new Date();
  return (
    access.status === "ACTIVE" &&
    access.startsAt <= now &&
    access.expiresAt > now &&
    !TERMINAL_STATUSES.includes(program.status)
  );
}

function isEditableIndependentProposal(userId: string, program: any) {
  return program.organizerType === "INDEPENDENT" && program.organizerUserId === userId && program.status === "REVISION_REQUIRED";
}

function organizerAccessExpiry(endDate: Date) {
  // Retain a short closing window so organizer can finish attendance and completion.
  return new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
}

async function volunteerProgramActorRole(userId: string, program: any): Promise<string> {
  const platformRole = await prisma.userRole.findFirst({ where: { userId, role: "SUPER_ADMIN" } });
  if (platformRole) return "SUPER_ADMIN";
  if (program.organizerType === "COMMUNITY" && program.communityId) {
    const membership = await prisma.communityMember.findUnique({ where: { communityId_userId: { communityId: program.communityId, userId } } });
    return membership?.role || "UNKNOWN";
  }
  return program.organizerUserId === userId ? "PROGRAM_ORGANIZER" : "UNKNOWN";
}

async function getProgram(programId: string) {
  return prisma.volunteerProgram.findUnique({
    where: { id: programId },
    include: {
      community: { select: { id: true, name: true, slug: true } },
      organizerUser: { select: { id: true, name: true, avatar: true } },
      accesses: { select: { userId: true, status: true, startsAt: true, expiresAt: true, revokedAt: true } },
      _count: { select: { applications: true } },
    },
  });
}

async function revokeManagementAccess(programId: string) {
  await prisma.volunteerProgramOrganizerAccess.updateMany({
    where: { volunteerProgramId: programId, status: "ACTIVE" },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
}

async function programNotifRecipients(program: { organizerType: string; communityId: string | null; organizerUserId: string }, excludeUserId?: string): Promise<string[]> {
  let recipients = new Set<string>();
  if (program.organizerType === "COMMUNITY" && program.communityId) {
    const managers = await prisma.communityMember.findMany({
      where: { communityId: program.communityId, status: "ACTIVE", deletedAt: null, role: { in: ["OWNER", "ADMIN", "VOLUNTEER_COORDINATOR"] } },
      select: { userId: true },
    });
    managers.forEach((m) => recipients.add(m.userId));
    recipients.add(program.organizerUserId);
  } else {
    recipients.add(program.organizerUserId);
  }
  if (excludeUserId) recipients.delete(excludeUserId);
  return Array.from(recipients);
}

type ProgramNotificationType = "SYSTEM" | "APPROVAL" | "EVENT";

async function notifyVolunteerProgram(targets: Array<{ userId: string; title: string; message: string; link: string }>, type: ProgramNotificationType) {
  try {
    if (targets.length === 0) return;
    await prisma.notification.createMany({
      data: targets.map((target) => ({ userId: target.userId, title: target.title, message: target.message, link: target.link, type })),
    });
  } catch {
    // Notification is a non-critical side effect; never fail the primary operation.
  }
}

function detail(program: any, userId?: string, canManage = false) {
  const userAccess = userId ? program.accesses.find((access: any) => access.userId === userId) : null;
  const now = new Date();
  const independentCanManage = Boolean(
    userAccess &&
      userAccess.status === "ACTIVE" &&
      userAccess.startsAt <= now &&
      userAccess.expiresAt > now &&
      !TERMINAL_STATUSES.includes(program.status)
  );
  return {
    id: program.id,
    title: program.title,
    slug: program.slug,
    description: program.description,
    location: program.location,
    capacity: program.capacity,
    registrationOpensAt: program.registrationOpensAt,
    registrationDeadline: program.registrationDeadline,
    startDate: program.startDate,
    endDate: program.endDate,
    status: program.status,
    registrationStatus: registrationState(program),
    canApply: isRegistrationOpen(program),
    organizerType: program.organizerType,
    organizer: program.organizerType === "COMMUNITY" ? program.community : program.organizerUser,
    applicationCount: program._count.applications,
    reviewNote: program.reviewNote,
    reviewedAt: program.reviewedAt,
    updatedAt: program.updatedAt,
    createdAt: program.createdAt,
    access: userAccess
      ? { status: userAccess.status, startsAt: userAccess.startsAt, expiresAt: userAccess.expiresAt, revokedAt: userAccess.revokedAt, canManage }
      : program.organizerType === "COMMUNITY" && userId
      ? { status: "COMMUNITY_SCOPED", startsAt: null, expiresAt: null, revokedAt: null, canManage }
        : null,
  };
}

// Public discovery. Independent programs never appear until governance approval.
volunteerProgramRoutes.get("/", optionalAuthMiddleware, async (c) => {
  const url = new URL(c.req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
  const search = url.searchParams.get("search")?.trim();
  const overrideStatus = url.searchParams.get("status")?.trim();
  const organizerType = url.searchParams.get("organizerType")?.trim();
  const categoryId = url.searchParams.get("categoryId")?.trim();
  const communityId = url.searchParams.get("communityId")?.trim();
  const upcomingParam = url.searchParams.get("upcoming")?.trim();
  const sort = url.searchParams.get("sort") === "asc" ? "asc" : "desc";
  const orderByRaw = url.searchParams.get("orderBy") || "startDate";
  const where: any = { deletedAt: null, status: { in: PUBLIC_STATUSES } };
  if (overrideStatus && PUBLIC_STATUSES.includes(overrideStatus as (typeof PUBLIC_STATUSES)[number])) {
    where.status = overrideStatus;
  }
  if (search) where.OR = [{ title: { contains: search } }, { description: { contains: search } }, { location: { contains: search } }];
  if (organizerType && ["COMMUNITY", "INDEPENDENT"].includes(organizerType)) where.organizerType = organizerType;
  if (categoryId) where.community = { categories: { some: { categoryId } } };
  if (communityId) where.communityId = communityId;
  if (upcomingParam === "true") where.startDate = { gte: new Date() };
  const orderByMap: Record<string, any> = {
    createdAt: { createdAt: sort },
    title: { title: sort },
    registrationDeadline: { registrationDeadline: sort === "asc" ? "asc" : "desc" },
    startDate: { startDate: sort === "asc" ? "asc" : "desc" },
  };
  const orderBy: any =
    orderByRaw === "applicationCount"
      ? { applications: { _count: sort } }
      : orderByMap[orderByRaw] || { startDate: sort };
  const [programs, total] = await Promise.all([
    prisma.volunteerProgram.findMany({
      where,
      include: {
        community: { select: { id: true, name: true, slug: true } },
        organizerUser: { select: { id: true, name: true, avatar: true } },
        accesses: false,
        _count: { select: { applications: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.volunteerProgram.count({ where }),
  ]);
  return c.json({
    success: true,
    data: programs.map((program) => {
      const organizer = program.organizerType === "COMMUNITY" ? program.community : program.organizerUser;
      return {
        id: program.id,
        title: program.title,
        slug: program.slug,
        description: program.description,
        location: program.location,
        capacity: program.capacity,
         registrationOpensAt: program.registrationOpensAt,
         registrationDeadline: program.registrationDeadline,
        startDate: program.startDate,
        endDate: program.endDate,
        status: program.status,
        organizerType: program.organizerType,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        organizer,
        applicationCount: program._count.applications,
        activityStartDate: program.startDate,
        activityEndDate: program.endDate,
        event: { id: program.id, title: program.title, slug: program.slug, eventDate: program.startDate, location: program.location, status: program.status, community: program.community },
      };
    }),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Personal context. This is separate from manager access and includes volunteer history.
volunteerProgramRoutes.get("/my", authMiddleware, async (c) => {
  const user = c.get("user");
  const [applications, programs] = await Promise.all([
    prisma.volunteerProgramApplication.findMany({
      where: { userId: user.id },
      include: {
        volunteerProgram: { include: { community: { select: { id: true, name: true, slug: true } }, organizerUser: { select: { id: true, name: true } } } },
        participation: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.volunteerProgram.findMany({
      where: { organizerUserId: user.id, deletedAt: null },
      include: { accesses: { where: { userId: user.id } }, _count: { select: { applications: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return c.json({ success: true, data: { applications, organizedPrograms: programs } });
});

volunteerProgramRoutes.post("/independent-proposals", authMiddleware, validate(createIndependentVolunteerProgramSchema), async (c) => {
  const user = c.get("user");
  const data = c.get("validated");
  if (!datesAreValid(data, true)) return c.json({ success: false, message: "Rentang jadwal program tidak valid" }, 400);
   const program = await createWithUniqueSlug((slug) =>
    prisma.volunteerProgram.create({
      data: {
        title: sanitizeText(data.title) ?? data.title, description: sanitizeText(data.description) ?? data.description, location: sanitizeText(data.location) ?? data.location,
         capacity: data.capacity, registrationOpensAt: data.registrationOpensAt ? parseDate(data.registrationOpensAt) : null, registrationDeadline: data.registrationDeadline ? parseDate(data.registrationDeadline) : null,
        startDate: parseDate(data.startDate), endDate: parseDate(data.endDate), slug,
        organizerType: "INDEPENDENT", organizerUserId: user.id, status: "DRAFT",
      },
    }),
    data.title
  );
  const submitted = await transitionVolunteerProgram({ programId: program.id, expectedStatus: "DRAFT", targetStatus: "SUBMITTED", actorId: user.id, actorRole: "PROGRAM_ORGANIZER" });
  const admins = await prisma.userRole.findMany({ where: { role: "SUPER_ADMIN" }, include: { user: { select: { email: true } } } });
  if (admins.length) {
    try {
      await notifyVolunteerProgram(admins.map((admin) => ({ userId: admin.userId, title: "Volunteer Baru Menunggu Review", message: `Program volunteer "${program.title}" telah dikirim untuk review.`, link: "/admin/volunteer/review-queue" })), "APPROVAL");
      await sendEmail({ to: admins.map((admin) => admin.user.email), subject: `Volunteer baru menunggu review: ${program.title}`, html: `<p>Program volunteer <strong>${program.title}</strong> telah dikirim untuk review.</p>` });
    } catch { /* notification delivery is non-critical */ }
  }
  return c.json({ success: true, message: "Proposal volunteer dikirim untuk ditinjau", data: submitted }, 201);
});

volunteerProgramRoutes.post("/communities/:communityId", authMiddleware, validate(createCommunityVolunteerProgramSchema), async (c) => {
  const user = c.get("user");
  const communityId = c.req.param("communityId") as string;
  const data = c.get("validated");
  if (communityId !== data.communityId) return c.json({ success: false, message: "Konteks komunitas tidak cocok" }, 400);
  if (!(await communityVolunteerPermission(user.id, communityId))) return c.json({ success: false, message: "Tidak memiliki volunteer.create pada komunitas ini" }, 403);
  if (!datesAreValid(data, true)) return c.json({ success: false, message: "Rentang jadwal program tidak valid" }, 400);
  const community = await prisma.community.findFirst({ where: { id: communityId, status: "APPROVED", deletedAt: null } });
  if (!community) return c.json({ success: false, message: "Komunitas tidak aktif" }, 404);
  const program = await createWithUniqueSlug((slug) =>
    prisma.volunteerProgram.create({
      data: {
        title: sanitizeText(data.title) ?? data.title, description: sanitizeText(data.description) ?? data.description, location: sanitizeText(data.location) ?? data.location,
         capacity: data.capacity, registrationOpensAt: data.registrationOpensAt ? parseDate(data.registrationOpensAt) : null, registrationDeadline: data.registrationDeadline ? parseDate(data.registrationDeadline) : null,
        startDate: parseDate(data.startDate), endDate: parseDate(data.endDate), slug,
        organizerType: "COMMUNITY", communityId, organizerUserId: user.id, status: "DRAFT",
      },
    }),
    data.title
  );
   await createAuditLog({ userId: user.id, actionType: "VOLUNTEER_PROGRAM_CREATE", resourceName: "VolunteerProgram", resourceId: program.id, afterData: { organizerType: "COMMUNITY", communityId } });
   const submitted = await transitionVolunteerProgram({ programId: program.id, expectedStatus: "DRAFT", targetStatus: "SUBMITTED", actorId: user.id, actorRole: await volunteerProgramActorRole(user.id, program) });
   const admins = await prisma.userRole.findMany({ where: { role: "SUPER_ADMIN" }, include: { user: { select: { email: true } } } });
    if (admins.length) {
      try {
        await notifyVolunteerProgram(admins.map((admin) => ({ userId: admin.userId, title: "Volunteer Baru Menunggu Review", message: `Program volunteer "${program.title}" telah dikirim untuk review.`, link: "/admin/volunteer/review-queue" })), "APPROVAL");
        await sendEmail({ to: admins.map((admin) => admin.user.email), subject: `Volunteer baru menunggu review: ${program.title}`, html: `<p>Program volunteer <strong>${program.title}</strong> telah dikirim untuk review.</p><p><a href="${process.env.APP_URL || "http://localhost:3000"}/admin/volunteer/review-queue">Buka antrean volunteer</a></p>` });
      } catch { /* notification delivery is non-critical */ }
    }
    return c.json({ success: true, message: "Program volunteer komunitas dikirim untuk review", data: submitted }, 201);
});

// Scoped manager discovery. A coordinator sees programs for only communities
// where the membership grants volunteer management; no global program listing.
volunteerProgramRoutes.get("/communities/:communityId", authMiddleware, async (c) => {
  const user = c.get("user");
  const communityId = c.req.param("communityId") as string;
  if (!(await communityVolunteerPermission(user.id, communityId))) return c.json({ success: false, message: "Tidak memiliki volunteer.view pada komunitas ini" }, 403);
  const programs = await prisma.volunteerProgram.findMany({
    where: { communityId, organizerType: "COMMUNITY", deletedAt: null },
    include: { _count: { select: { applications: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return c.json({ success: true, data: programs });
});

volunteerProgramRoutes.post("/:programId/submit", authMiddleware, async (c) => {
  const user = c.get("user");
  const program = await getProgram(c.req.param("programId") as string);
  if (!program || program.deletedAt) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  const canSubmit = program.organizerType === "INDEPENDENT"
    ? program.organizerUserId === user.id
    : program.organizerType === "COMMUNITY" && program.communityId
      ? await communityVolunteerPermission(user.id, program.communityId)
      : false;
  if (!canSubmit) return c.json({ success: false, message: "Tidak memiliki akses mengirim program" }, 403);
  if (program.status !== "DRAFT" && program.status !== "REVISION_REQUIRED") return c.json({ success: false, message: "Program tidak dapat dikirim pada status ini" }, 400);
  if (program.status === "REVISION_REQUIRED" && (!program.reviewedAt || program.updatedAt <= program.reviewedAt)) return c.json({ success: false, message: "Simpan revisi sebelum mengirim ulang" }, 400);
  const submitted = await transitionVolunteerProgram({ programId: program.id, expectedStatus: program.status, targetStatus: "SUBMITTED", actorId: user.id, actorRole: await volunteerProgramActorRole(user.id, program) });
  return c.json({ success: true, data: submitted });
});

volunteerProgramRoutes.post("/:programId/resubmit", authMiddleware, async (c) => {
  const user = c.get("user");
  const program = await getProgram(c.req.param("programId") as string);
  if (!program || program.deletedAt) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  if (program.organizerType !== "INDEPENDENT" || program.organizerUserId !== user.id || program.status !== "REVISION_REQUIRED") return c.json({ success: false, message: "Proposal tidak dapat dikirim ulang" }, 403);
  if (!program.reviewedAt || program.updatedAt <= program.reviewedAt) return c.json({ success: false, message: "Simpan revisi proposal sebelum mengirim ulang" }, 400);
  const submitted = await transitionVolunteerProgram({ programId: program.id, expectedStatus: "REVISION_REQUIRED", targetStatus: "SUBMITTED", actorId: user.id, actorRole: "PROGRAM_ORGANIZER", reviewNote: null });
  return c.json({ success: true, data: submitted });
});

volunteerProgramRoutes.get("/my/saved", authMiddleware, async (c) => {
  const user = c.get("user");
  const url = new URL(c.req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
  const where = { userId: user.id, volunteerProgram: { deletedAt: null } };
  const [saved, total] = await Promise.all([
    prisma.volunteerProgramSave.findMany({ where, include: { volunteerProgram: { select: { id: true, title: true, slug: true, description: true, status: true, startDate: true, endDate: true, location: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.volunteerProgramSave.count({ where }),
  ]);
  return c.json({ success: true, data: saved.map((item) => ({ ...item.volunteerProgram, savedAt: item.createdAt })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

volunteerProgramRoutes.get("/admin/review-queue", authMiddleware, requireSuperAdmin(), async (c) => {
  const programs = await prisma.volunteerProgram.findMany({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] }, deletedAt: null },
    include: {
      organizerUser: { select: { id: true, name: true, email: true, avatar: true } },
      community: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return c.json({ success: true, data: programs });
});

// Governance panel. Superadmin-level oversight over the whole volunteer-program
// system: aggregate stats, program registry, applications and attendance.
volunteerProgramRoutes.get("/admin/stats", authMiddleware, requireSuperAdmin(), async (c) => {
  const [totalPrograms, activeVolunteers, pendingApplications, totalApplications, totalAttended, totalRegistrations] = await Promise.all([
    prisma.volunteerProgram.count({ where: { deletedAt: null } }),
    prisma.volunteerProgramParticipation.count({ where: { status: { in: ["UPCOMING", "COMPLETED"] } } }),
    prisma.volunteerProgramApplication.count({ where: { status: "PENDING" } }),
    prisma.volunteerProgramApplication.count(),
    prisma.volunteerProgramParticipation.count({ where: { attendance: "ATTENDED" } }),
    prisma.volunteerProgramParticipation.count(),
  ]);
  return c.json({ success: true, data: { totalPrograms, activeVolunteers, pendingApplications, totalApplications, totalAttended, totalRegistrations } });
});

volunteerProgramRoutes.get("/admin/programs", authMiddleware, requireSuperAdmin(), async (c) => {
  const url = new URL(c.req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
  const status = url.searchParams.get("status") || "";
  const search = url.searchParams.get("search")?.trim() || "";
  const where: Record<string, any> = { deletedAt: null };
  if (status && status !== "ALL") where.status = status;
  if (search) where.OR = [{ title: { contains: search } }, { location: { contains: search } }];
  const [programs, total] = await Promise.all([
    prisma.volunteerProgram.findMany({
      where,
      include: {
        community: { select: { id: true, name: true } },
        organizerUser: { select: { id: true, name: true, email: true } },
        applications: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.volunteerProgram.count({ where }),
  ]);
  return c.json({
    success: true,
    data: programs.map((program) => ({
      id: program.id,
      title: program.title,
      status: program.status,
      organizerType: program.organizerType,
      capacity: program.capacity,
      startDate: program.startDate,
      endDate: program.endDate,
      createdAt: program.createdAt,
      community: program.community,
      organizer: program.organizerUser,
      applicationCount: program.applications.length,
      volunteers: program.applications.filter((application) => application.status === "ACCEPTED").length,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

volunteerProgramRoutes.get("/admin/applications", authMiddleware, requireSuperAdmin(), async (c) => {
  const url = new URL(c.req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
  const status = url.searchParams.get("status") || "";
  const where: Record<string, any> = {};
  if (status && status !== "ALL") where.status = status;
  const [applications, total] = await Promise.all([
    prisma.volunteerProgramApplication.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        volunteerProgram: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.volunteerProgramApplication.count({ where }),
  ]);
  return c.json({
    success: true,
    data: applications.map((application) => ({
      id: application.id,
      status: application.status,
      motivation: application.motivation,
      reviewedAt: application.reviewedAt,
      reviewNote: application.reviewNote,
      appliedAt: application.createdAt,
      applicant: application.user,
      program: application.volunteerProgram,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

volunteerProgramRoutes.get("/admin/attendance", authMiddleware, requireSuperAdmin(), async (c) => {
  const participations = await prisma.volunteerProgramParticipation.findMany({
    where: { attendance: { not: "NOT_RECORDED" } },
    include: {
      application: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          volunteerProgram: { select: { id: true, title: true, startDate: true } },
        },
      },
    },
    orderBy: { attendedAt: "desc" },
  });
  return c.json({
    success: true,
    data: participations.map((participation) => ({
      id: participation.id,
      status: participation.attendance,
      attendedAt: participation.attendedAt,
      date: participation.attendedAt || participation.application.volunteerProgram.startDate,
      volunteer: participation.application.user,
      program: { id: participation.application.volunteerProgram.id, name: participation.application.volunteerProgram.title },
    })),
  });
});

volunteerProgramRoutes.get("/detail/:slug", optionalAuthMiddleware, async (c) => {
  const user = c.get("user");
  const program = await prisma.volunteerProgram.findUnique({
    where: { slug: c.req.param("slug") },
    include: { community: { select: { id: true, name: true, slug: true } }, organizerUser: { select: { id: true, name: true, avatar: true } }, _count: { select: { applications: true } } },
  });
  if (!program || program.deletedAt || !PUBLIC_STATUSES.includes(program.status as (typeof PUBLIC_STATUSES)[number])) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  const [userApplication, acceptedCount, isSaved] = await Promise.all([
    user ? prisma.volunteerProgramApplication.findUnique({ where: { volunteerProgramId_userId: { volunteerProgramId: program.id, userId: user.id } } }) : Promise.resolve(null),
    prisma.volunteerProgramApplication.count({ where: { volunteerProgramId: program.id, status: "ACCEPTED" } }),
    user ? prisma.volunteerProgramSave.findUnique({ where: { volunteerProgramId_userId: { volunteerProgramId: program.id, userId: user.id } }, select: { id: true } }).then(Boolean).catch(() => false) : Promise.resolve(false),
  ]);
  const applicationCount = program._count.applications;
  return c.json({ success: true, data: {
    id: program.id, title: program.title, slug: program.slug, description: program.description, status: program.status,
    registrationOpensAt: program.registrationOpensAt, registrationDeadline: program.registrationDeadline, registrationStatus: registrationState(program), canApply: isRegistrationOpen(program), activityStartDate: program.startDate, activityEndDate: program.endDate,
    location: program.location,
    coverImage: null, thumbnail: null, createdBy: program.organizerUser,
    organizer: program.organizerType === "COMMUNITY" ? program.community : program.organizerUser,
    event: { id: program.id, title: program.title, slug: program.slug, eventDate: program.startDate, endDate: program.endDate, location: program.location, locationType: "OFFLINE", status: program.status, community: program.community, organization: null },
    capacity: program.capacity, applicationCount, acceptedCount, slotsLeft: Math.max(program.capacity - acceptedCount, 0),
    userApplication,
    isSaved,
  } });
});

volunteerProgramRoutes.post("/:programId/save", authMiddleware, async (c) => {
  const user = c.get("user");
  const volunteerProgramId = c.req.param("programId") as string;
  const program = await prisma.volunteerProgram.findFirst({ where: { id: volunteerProgramId, deletedAt: null }, select: { id: true } });
  if (!program) return c.json({ success: false, message: "Program volunteer tidak ditemukan" }, 404);
  await prisma.volunteerProgramSave.upsert({ where: { volunteerProgramId_userId: { volunteerProgramId, userId: user.id } }, create: { volunteerProgramId, userId: user.id }, update: {} });
  return c.json({ success: true, message: "Volunteer berhasil disimpan" });
});

volunteerProgramRoutes.delete("/:programId/save", authMiddleware, async (c) => {
  const user = c.get("user");
  await prisma.volunteerProgramSave.deleteMany({ where: { volunteerProgramId: c.req.param("programId") as string, userId: user.id } });
  return c.json({ success: true, message: "Volunteer dihapus dari daftar tersimpan" });
});

async function discoveryPrograms(where: any, orderBy: any, take: number) {
  const programs = await prisma.volunteerProgram.findMany({
    where,
    include: {
      community: { select: { id: true, name: true, slug: true } },
      organizerUser: { select: { id: true, name: true, avatar: true } },
      accesses: false,
      _count: { select: { applications: true } },
    },
    orderBy,
    take,
  });
  return programs.map((program) => ({
    id: program.id,
    title: program.title,
    slug: program.slug,
    description: program.description,
    location: program.location,
    status: program.status,
    organizerType: program.organizerType,
    startDate: program.startDate,
    endDate: program.endDate,
    registrationDeadline: program.registrationDeadline,
    registrationOpensAt: program.registrationOpensAt,
    createdAt: program.createdAt,
    capacity: program.capacity,
    organizer: program.organizerType === "COMMUNITY" ? program.community : program.organizerUser,
    applicationCount: program._count.applications,
    community: program.community,
  }));
}

const PUBLIC_WHERE = (): any => ({ deletedAt: null, status: { in: PUBLIC_STATUSES } });

const discoveryCache = new Map<string, { expiresAt: number; data: unknown }>();
const DISCOVERY_TTL_MS = 60_000;

async function cachedDiscovery(key: string, loader: () => Promise<unknown>) {
  const cached = discoveryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const data = await loader();
  discoveryCache.set(key, { expiresAt: Date.now() + DISCOVERY_TTL_MS, data });
  return data;
}

volunteerProgramRoutes.get("/upcoming", async (c) => {
  const programs = await cachedDiscovery("vp-upcoming", () => discoveryPrograms({ ...PUBLIC_WHERE(), startDate: { gte: new Date() } }, { startDate: "asc" }, 6));
  return c.json({ success: true, data: programs });
});

volunteerProgramRoutes.get("/popular", async (c) => {
  const programs = await cachedDiscovery("vp-popular", () => discoveryPrograms({ ...PUBLIC_WHERE() }, { applications: { _count: "desc" } }, 6));
  return c.json({ success: true, data: programs });
});

volunteerProgramRoutes.get("/featured", async (c) => {
  const featured = await cachedDiscovery("vp-featured", () => discoveryPrograms({ ...PUBLIC_WHERE(), status: { in: ["SCHEDULED", "REGISTRATION_OPEN"] }, startDate: { gte: new Date() } }, { startDate: "asc" }, 6));
  return c.json({ success: true, data: featured });
});

volunteerProgramRoutes.get("/new", async (c) => {
  const programs = await cachedDiscovery("vp-new", () => discoveryPrograms(PUBLIC_WHERE(), { createdAt: "desc" }, 6));
  return c.json({ success: true, data: programs });
});

volunteerProgramRoutes.get("/:programId", optionalAuthMiddleware, async (c) => {
  const user = c.get("user");
  const program = await getProgram(c.req.param("programId") as string);
  if (!program || program.deletedAt) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  const ownsIndependentProposal = user && program.organizerType === "INDEPENDENT" && program.organizerUserId === user.id;
  const ownApplication = user ? await prisma.volunteerProgramApplication.findUnique({ where: { volunteerProgramId_userId: { volunteerProgramId: program.id, userId: user.id } } }) : null;
  const canViewPrivate = user ? ownsIndependentProposal || await organizerAccess(user.id, program, false) : false;
  const canManage = user ? await organizerAccess(user.id, program, true) : false;
  if (!PUBLIC_STATUSES.includes(program.status as (typeof PUBLIC_STATUSES)[number]) && !canViewPrivate && !ownApplication) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  return c.json({ success: true, data: detail(program, user?.id, canManage) });
});

volunteerProgramRoutes.patch("/:programId", authMiddleware, validate(updateVolunteerProgramSchema), async (c) => {
  const user = c.get("user");
  const data = c.get("validated");
  const program = await getProgram(c.req.param("programId") as string);
  if (!program || program.deletedAt) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  if (!(await organizerAccess(user.id, program, true)) && !isEditableIndependentProposal(user.id, program)) return c.json({ success: false, message: "Management access tidak aktif" }, 403);
  if (!datesAreValid({ registrationOpensAt: data.registrationOpensAt ?? program.registrationOpensAt?.toISOString(), registrationDeadline: data.registrationDeadline ?? program.registrationDeadline?.toISOString(), startDate: data.startDate ?? program.startDate.toISOString(), endDate: data.endDate ?? program.endDate.toISOString() })) return c.json({ success: false, message: "Rentang jadwal program tidak valid" }, 400);
  if (data.capacity !== undefined) {
    const accepted = await prisma.volunteerProgramApplication.count({ where: { volunteerProgramId: program.id, status: "ACCEPTED" } });
    if (data.capacity < accepted) return c.json({ success: false, message: "Kuota tidak dapat lebih kecil dari peserta yang telah diterima" }, 400);
  }
  const updated = await prisma.volunteerProgram.update({
    where: { id: program.id },
    data: {
      ...(data.title ? { title: sanitizeText(data.title) ?? data.title } : {}), ...(data.description ? { description: sanitizeText(data.description) ?? data.description } : {}), ...(data.location ? { location: sanitizeText(data.location) ?? data.location } : {}),
      ...(data.capacity ? { capacity: data.capacity } : {}), ...(data.registrationOpensAt ? { registrationOpensAt: parseDate(data.registrationOpensAt) } : {}), ...(data.registrationDeadline ? { registrationDeadline: parseDate(data.registrationDeadline) } : {}),
      ...(data.startDate ? { startDate: parseDate(data.startDate) } : {}), ...(data.endDate ? { endDate: parseDate(data.endDate) } : {}),
    },
  });
  return c.json({ success: true, data: updated });
});

volunteerProgramRoutes.post("/:programId/transition", authMiddleware, validate(transitionVolunteerProgramSchema), async (c) => {
  const user = c.get("user");
  const { status } = c.get("validated");
  const program = await getProgram(c.req.param("programId") as string);
  if (!program || program.deletedAt) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  if (!(await organizerAccess(user.id, program, true))) return c.json({ success: false, message: "Management access tidak aktif" }, 403);
  if (!ORGANIZER_TRANSITIONS.has(status)) return c.json({ success: false, message: `Organizer tidak dapat mengubah status ke ${status}. Gunakan submit/review untuk status review.` }, 400);
  if (!VOLUNTEER_PROGRAM_TRANSITIONS[program.status]?.includes(status)) return c.json({ success: false, message: `Transisi ${program.status} ke ${status} tidak valid` }, 400);
  const updated = await transitionVolunteerProgram({ programId: program.id, expectedStatus: program.status, targetStatus: status, actorId: user.id, actorRole: await volunteerProgramActorRole(user.id, program) });
  if (TERMINAL_STATUSES.includes(status)) await revokeManagementAccess(program.id);
  if (status === "CANCELLED") {
    const applicants = await prisma.volunteerProgramApplication.findMany({
      where: { volunteerProgramId: program.id, status: { in: ["PENDING", "ACCEPTED"] } },
      select: { userId: true },
      take: 100,
    });
    await notifyVolunteerProgram(
      applicants.map((app) => ({ userId: app.userId, title: "Program Volunteer Dibatalkan", message: `Program volunteer "${program.title}" telah dibatalkan.`, link: `/volunteer/${program.slug}` })),
      "SYSTEM"
    );
  }
  return c.json({ success: true, data: updated });
});

volunteerProgramRoutes.post("/:programId/apply", authMiddleware, validate(applyVolunteerProgramSchema), async (c) => {
  const user = c.get("user");
  const data = c.get("validated");
  const programId = c.req.param("programId") as string;
  const application = await applyToVolunteerProgram({ programId, userId: user.id, actorRole: "MEMBER", motivation: data.motivation }).catch((error) => error as VolunteerProgramApplicationError);
  if (application instanceof VolunteerProgramApplicationError) {
    const messages: Record<string, string> = { PROGRAM_NOT_FOUND: "Program tidak ditemukan", ORGANIZER_CANNOT_APPLY: "Penyelenggara tidak dapat mendaftar ke program sendiri", REGISTRATION_NOT_OPEN: "Pendaftaran belum dibuka", REGISTRATION_DEADLINE_PASSED: "Batas pendaftaran sudah lewat", VOLUNTEER_ALREADY_APPLIED: "Sudah mengajukan volunteer pada program ini", QUOTA_FULL: "Kuota program sudah penuh" };
    const status = ["VOLUNTEER_ALREADY_APPLIED", "QUOTA_FULL"].includes(application.code) ? 409 : application.code === "PROGRAM_NOT_FOUND" ? 404 : 400;
    return c.json({ success: false, code: application.code, message: messages[application.code] || "Pendaftaran tidak dapat diproses" }, status);
  }
  const program = await prisma.volunteerProgram.findUnique({ where: { id: programId }, select: { id: true, title: true, slug: true, organizerType: true, communityId: true, organizerUserId: true } });
  if (program) {
    try {
      const recipientIds = await programNotifRecipients(program, user.id);
      await notifyVolunteerProgram(
        recipientIds.map((recipientId) => ({ userId: recipientId, title: "Pendaftaran Volunteer Baru", message: `"${program.title}" menerima pendaftaran volunteer baru.`, link: `/volunteer/${program.slug}` })),
        "SYSTEM"
      );
      await prisma.activityHistory.create({
        data: { userId: user.id, action: "VOLUNTEER_PROGRAM_APPLY", details: { programId: program.id, programTitle: program.title } as any },
      });
    } catch {
      // Notification and history are non-critical side effects.
    }
  }
  return c.json({ success: true, message: "Pendaftaran volunteer dikirim", data: application }, 201);
});

volunteerProgramRoutes.delete("/:programId/apply", authMiddleware, async (c) => {
  const user = c.get("user");
  const application = await prisma.volunteerProgramApplication.findUnique({ where: { volunteerProgramId_userId: { volunteerProgramId: c.req.param("programId") as string, userId: user.id } } });
  if (!application || !["PENDING", "ACCEPTED"].includes(application.status)) return c.json({ success: false, message: "Pendaftaran aktif tidak ditemukan" }, 404);
  const updated = await prisma.$transaction(async (tx) => {
    const changed = await tx.volunteerProgramApplication.updateMany({ where: { id: application.id, status: { in: ["PENDING", "ACCEPTED"] } }, data: { status: "CANCELLED_BY_USER", cancellationReason: "Dibatalkan oleh peserta" } });
    if (changed.count !== 1) return null;
    await tx.volunteerProgramApplicationHistory.create({ data: { applicationId: application.id, previousStatus: application.status, newStatus: "CANCELLED_BY_USER", actorId: user.id, actorRole: "MEMBER", reason: "Dibatalkan oleh peserta" } });
    await tx.volunteerProgramParticipation.updateMany({ where: { applicationId: application.id }, data: { status: "CANCELLED" } });
    await tx.auditLog.create({ data: { userId: user.id, actionType: "VOLUNTEER_PROGRAM_APPLICATION_TRANSITION", resourceName: "VolunteerProgramApplication", resourceId: application.id, beforeData: { status: application.status } as any, afterData: { status: "CANCELLED_BY_USER" } as any } });
    return tx.volunteerProgramApplication.findUniqueOrThrow({ where: { id: application.id } });
  });
  if (!updated) return c.json({ success: false, code: "APPLICATION_STATUS_CHANGED", message: "Status pendaftaran telah berubah" }, 409);
  return c.json({ success: true, data: updated });
});

volunteerProgramRoutes.get("/:programId/applications", authMiddleware, async (c) => {
  const user = c.get("user");
  const program = await getProgram(c.req.param("programId") as string);
  if (!program || program.deletedAt) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  if (!(await organizerAccess(user.id, program, true))) return c.json({ success: false, message: "Management access tidak aktif" }, 403);
  const applications = await prisma.volunteerProgramApplication.findMany({ where: { volunteerProgramId: program.id }, include: { user: { select: { id: true, name: true, email: true, avatar: true } }, participation: true }, orderBy: { createdAt: "desc" } });
  return c.json({ success: true, data: applications });
});

volunteerProgramRoutes.patch("/applications/:applicationId/review", authMiddleware, validate(reviewVolunteerProgramApplicationSchema), async (c) => {
  const user = c.get("user");
  const data = c.get("validated");
  const application = await prisma.volunteerProgramApplication.findUnique({ where: { id: c.req.param("applicationId") }, include: { volunteerProgram: true } });
  if (!application || application.volunteerProgram.deletedAt) return c.json({ success: false, message: "Pendaftaran tidak ditemukan" }, 404);
  if (application.userId === user.id) return c.json({ success: false, message: "Tidak dapat mereview pendaftaran volunteer sendiri" }, 403);
  if (!(await organizerAccess(user.id, application.volunteerProgram, true))) return c.json({ success: false, message: "Management access tidak aktif" }, 403);
  if (data.action === "ACCEPT") {
    if (application.status !== "PENDING") return c.json({ success: false, message: "Hanya pendaftaran pending dapat diterima" }, 400);
    const updated = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT \`capacity\` FROM \`volunteer_programs\` WHERE \`id\` = ${application.volunteerProgramId} FOR UPDATE`;
      const accepted = await tx.volunteerProgramApplication.count({ where: { volunteerProgramId: application.volunteerProgramId, status: "ACCEPTED" } });
      if (accepted >= application.volunteerProgram.capacity) throw new Error("PROGRAM_CAPACITY_FULL");
      const changed = await tx.volunteerProgramApplication.updateMany({ where: { id: application.id, status: "PENDING" }, data: { status: "ACCEPTED", reviewedAt: new Date(), reviewedById: user.id, reviewNote: data.note } });
      if (changed.count !== 1) throw new Error("APPLICATION_STATUS_CHANGED");
      const acceptedApplication = await tx.volunteerProgramApplication.findUniqueOrThrow({ where: { id: application.id } });
      await tx.volunteerProgramApplicationHistory.create({ data: { applicationId: application.id, previousStatus: "PENDING", newStatus: "ACCEPTED", actorId: user.id, actorRole: await volunteerProgramActorRole(user.id, application.volunteerProgram), reason: data.note || null } });
      await tx.volunteerProgramParticipation.upsert({ where: { applicationId: application.id }, create: { applicationId: application.id }, update: {} });
      return acceptedApplication;
    }).catch((error) => ["PROGRAM_CAPACITY_FULL", "APPLICATION_STATUS_CHANGED"].includes(error?.message) ? null : Promise.reject(error));
if (!updated) return c.json({ success: false, message: "Kuota program sudah penuh" }, 409);
    try {
      await notifyVolunteerProgram(
        [{ userId: application.userId, title: "Pendaftaran Volunteer Diterima", message: `Selamat! Pendaftaran volunteer "${application.volunteerProgram.title}" telah disetujui.`, link: `/volunteer/${application.volunteerProgram.slug}` }],
        "APPROVAL"
      );
      await prisma.activityHistory.create({
        data: { userId: application.userId, action: "VOLUNTEER_PROGRAM_ACCEPTED", details: { programId: application.volunteerProgram.id, programTitle: application.volunteerProgram.title } as any },
      });
    } catch {
      // Notification and history are non-critical side effects.
    }
    return c.json({ success: true, data: updated });
  }
  if (application.status !== "PENDING" && application.status !== "ACCEPTED") return c.json({ success: false, message: "Pendaftaran tidak dapat diubah" }, 400);
  const status = data.action === "REJECT" ? "REJECTED" : "CANCELLED_BY_ORGANIZER";
  const updated = await transitionVolunteerProgramApplication({ applicationId: application.id, expectedStatus: ["PENDING", "ACCEPTED"], targetStatus: status, actorId: user.id, actorRole: await volunteerProgramActorRole(user.id, application.volunteerProgram), reason: data.note, reviewNote: data.note });
  if (data.action === "CANCEL") await prisma.volunteerProgramParticipation.updateMany({ where: { applicationId: application.id }, data: { status: "CANCELLED" } });
  await notifyVolunteerProgram(
    [{ userId: application.userId, title: data.action === "REJECT" ? "Pendaftaran Volunteer Ditolak" : "Pendaftaran Volunteer Dibatalkan", message: data.action === "REJECT" ? `Pendaftaran volunteer "${application.volunteerProgram.title}" tidak disetujui.` : `Pendaftaran volunteer "${application.volunteerProgram.title}" dibatalkan oleh penyelenggara.`, link: `/volunteer/${application.volunteerProgram.slug}` }],
    "APPROVAL"
  );
  return c.json({ success: true, data: updated });
});

volunteerProgramRoutes.patch("/applications/:applicationId/attendance", authMiddleware, validate(recordVolunteerProgramAttendanceSchema), async (c) => {
  const user = c.get("user");
  const { attendance } = c.get("validated");
  const application = await prisma.volunteerProgramApplication.findUnique({ where: { id: c.req.param("applicationId") }, include: { volunteerProgram: true, participation: true } });
  if (!application?.participation || application.volunteerProgram.deletedAt) return c.json({ success: false, message: "Partisipasi tidak ditemukan" }, 404);
  if (!(await organizerAccess(user.id, application.volunteerProgram, true))) return c.json({ success: false, message: "Management access tidak aktif" }, 403);
  if (application.status !== "ACCEPTED" || application.participation.status !== "UPCOMING" || application.volunteerProgram.status !== "ONGOING") return c.json({ success: false, message: "Attendance hanya dapat dicatat untuk peserta aktif saat program berlangsung" }, 400);
  const participation = await prisma.volunteerProgramParticipation.update({ where: { applicationId: application.id }, data: { attendance, attendedAt: attendance === "ATTENDED" ? new Date() : null } });
  return c.json({ success: true, data: participation });
});

// Governance endpoint. Superadmin reviews independent proposals and
// community programs; self-review is always blocked.
volunteerProgramRoutes.post("/:programId/review", authMiddleware, requireSuperAdmin(), validate(reviewVolunteerProgramSchema), async (c) => {
  const admin = c.get("user");
  const { action, note } = c.get("validated");
  const program = await prisma.volunteerProgram.findUnique({ where: { id: c.req.param("programId") } });
  if (!program || program.deletedAt) return c.json({ success: false, message: "Program tidak ditemukan" }, 404);
  if (program.organizerUserId === admin.id) return c.json({ success: false, message: "Superadmin tidak dapat mereview program sendiri" }, 403);
  if (!["UNDER_REVIEW", "SUBMITTED"].includes(program.status)) return c.json({ success: false, message: "Program tidak dalam antrean review" }, 400);
  const status = action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "REVISION_REQUIRED";
  const inReview = program.status === "SUBMITTED"
    ? await transitionVolunteerProgram({ programId: program.id, expectedStatus: "SUBMITTED", targetStatus: "UNDER_REVIEW", actorId: admin.id, actorRole: "SUPER_ADMIN", reason: "Review diambil oleh superadmin" })
    : program;
  const updated = await transitionVolunteerProgram({ programId: program.id, expectedStatus: inReview.status, targetStatus: status, actorId: admin.id, actorRole: "SUPER_ADMIN", reason: note, reviewNote: note || null, reviewedAt: new Date(), reviewedById: admin.id }).catch((error) => error instanceof VolunteerProgramTransitionError && error.message === "VOLUNTEER_PROGRAM_STATUS_CHANGED" ? null : Promise.reject(error));
  if (!updated) return c.json({ success: false, message: "Program sudah direview oleh administrator lain" }, 409);
  if (action === "APPROVE") {
    await prisma.volunteerProgramOrganizerAccess.upsert({ where: { volunteerProgramId_userId: { volunteerProgramId: program.id, userId: program.organizerUserId } }, create: { volunteerProgramId: program.id, userId: program.organizerUserId, startsAt: new Date(), expiresAt: organizerAccessExpiry(program.endDate), status: "ACTIVE" }, update: { startsAt: new Date(), expiresAt: organizerAccessExpiry(program.endDate), status: "ACTIVE", revokedAt: null } });
  }
  const resultLabel = action === "APPROVE" ? "disetujui" : action === "REJECT" ? "ditolak" : "memerlukan revisi";
  await notifyVolunteerProgram(
    [{ userId: program.organizerUserId, title: `Program Volunteer ${resultLabel}`, message: `Program volunteer "${program.title}" ${resultLabel}.${note ? ` Catatan: ${note}` : ""}`, link: `/dashboard/volunteer-programs/${program.id}` }],
    "APPROVAL"
  );
  const recipient = await prisma.user.findUnique({ where: { id: program.organizerUserId }, select: { email: true } });
  if (recipient?.email) {
    try {
      await sendEmail({ to: recipient.email, subject: `Status review volunteer: ${program.title}`, html: `<p>Program volunteer <strong>${program.title}</strong> ${resultLabel}.</p>${note ? `<p>Catatan: ${note}</p>` : ""}` });
    } catch { /* notification delivery is non-critical */ }
  }
  return c.json({ success: true, data: updated });
});
