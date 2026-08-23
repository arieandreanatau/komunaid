import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100),
    username: z
      .string()
      .min(3, "Username minimal 3 karakter")
      .max(30, "Username maksimal 30 karakter")
      .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
    email: z.string().email("Email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email atau username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email atau username wajib diisi"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token wajib diisi"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Password baru tidak cocok",
  path: ["confirmNewPassword"],
});

export const updateInterestsSchema = z.object({
  interests: z.array(z.string().max(50)).max(20, "Maksimal 20 interests"),
});

// ==========================================
// COMMUNITY MEMBER SCHEMAS
// ==========================================

export const joinCommunitySchema = z.object({
  message: z.string().max(500).optional(),
});

export const handleJoinRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

// ==========================================
// REPORT SCHEMAS (Admin)
// ==========================================

export const reviewReportSchema = z.object({
  action: z.enum(["SUSPENDED", "DISMISSED"]),
  note: z.string().max(2000).optional(),
});

export const assignRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "PLATFORM_ADMIN", "MEMBER"]),
});

// ==========================================
// CATEGORY SCHEMAS
// ==========================================

export const createCategorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50),
  description: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ==========================================
// USER SCHEMAS
// ==========================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .max(20, "Nomor telepon maksimal 20 karakter")
    .regex(/^[\d\s\-+().]+$/, "Format nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatar: z.string().min(1).max(2000).optional(),
});

// ==========================================
// COMMUNITY SCHEMAS
// ==========================================

export const createCommunitySchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(2000, "Deskripsi maksimal 2000 karakter").optional(),
  coverImage: z.string().url("URL cover image tidak valid").optional(),
  logo: z.string().url("URL logo tidak valid").optional(),
  banner: z.string().url("URL banner tidak valid").optional(),
  location: z.string().max(100, "Lokasi maksimal 100 karakter").optional(),
  address: z.string().max(200).optional(),
  address1: z.string().max(200).optional(),
  address2: z.string().max(200).optional(),
  postalCode: z.string().max(10).optional(),
  village: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  customCategory: z.string().max(50).optional(),
  website: z.string().url("URL website tidak valid").optional(),
  instagram: z.string().max(100).optional(),
  contactEmail: z.string().email("Email tidak valid").optional(),
  contactPhone: z.string().max(20).optional(),
  membershipType: z.enum(["OPEN", "RESTRICTED"]).default("OPEN"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  categoryIds: z.array(z.string()).max(5, "Maksimal 5 kategori").optional(),
  tags: z.array(z.string().max(30)).max(10, "Maksimal 10 tag").optional(),
});

export const updateCommunitySchema = createCommunitySchema.partial();

export const updateCommunityProfileSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  address1: z.string().max(200).optional(),
  address2: z.string().max(200).optional(),
  postalCode: z.string().max(10).optional(),
  village: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  website: z.string().url("URL website tidak valid").optional().or(z.literal("")),
});

export const updateCommunityBannerSchema = z.object({
  banner: z.string().url("URL banner tidak valid").optional().or(z.literal("")),
});

export const updateCommunityLogoSchema = z.object({
  logo: z.string().url("URL logo tidak valid").optional().or(z.literal("")),
});

export const updateCommunitySettingsSchema = z.object({
  allowMemberPost: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  showMemberList: z.boolean().optional(),
  showEventList: z.boolean().optional(),
});

export const changeMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "EVENT_MANAGER", "VOLUNTEER_COORDINATOR", "MEMBER"]),
});

export const communityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.preprocess(emptyToUndefined, z.string().optional()),
  status: z.preprocess(
    emptyToUndefined,
    z
      .enum([
        "DRAFT",
        "PENDING_REVIEW",
        "APPROVED",
        "REJECTED",
        "SUSPENDED",
        "ARCHIVED",
      ])
      .optional()
  ),
  visibility: z.preprocess(
    emptyToUndefined,
    z.enum(["PUBLIC", "PRIVATE"]).optional()
  ),
  membershipType: z.preprocess(
    emptyToUndefined,
    z.enum(["OPEN", "RESTRICTED"]).optional()
  ),
  categoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  category: z.preprocess(emptyToUndefined, z.string().optional()),
  province: z.preprocess(emptyToUndefined, z.string().optional()),
  city: z.preprocess(emptyToUndefined, z.string().optional()),
  tag: z.preprocess(emptyToUndefined, z.string().optional()),
  featured: z.preprocess(emptyToUndefined, z.coerce.boolean().optional()),
  sort: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.enum(["createdAt", "name", "memberCount"]).default("createdAt"),
});

// ==========================================
// COMMUNITY SUBMISSION SCHEMAS
// ==========================================

export const submitCommunitySchema = z.object({});

export const adminReviewCommunitySchema = z.object({
  note: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
});

export const suspendCommunitySchema = z.object({
  reason: z.string().min(1, "Alasan wajib diisi").max(2000, "Alasan maksimal 2000 karakter"),
});

// ==========================================
// COMMUNITY MEDIA SCHEMAS
// ==========================================

export const createCommunityMediaSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200, "Judul maksimal 200 karakter"),
  content: z.string().min(10, "Konten minimal 10 karakter").max(5000, "Konten maksimal 5000 karakter"),
  type: z.enum(["ANNOUNCEMENT", "NEWS", "GALLERY", "FORUM_POST"]).default("ANNOUNCEMENT"),
  imageUrl: z.string().url("URL gambar tidak valid").optional(),
  isPublished: z.boolean().default(false),
});

export const updateCommunityMediaSchema = createCommunityMediaSchema.partial();

export const communityMediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(["ANNOUNCEMENT", "NEWS", "GALLERY", "FORUM_POST"]).optional(),
  published: z.coerce.boolean().optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.enum(["createdAt", "title", "publishedAt"]).default("createdAt"),
});

export const createForumReplySchema = z.object({
  content: z.string().min(1, "Konten wajib diisi").max(5000, "Konten maksimal 5000 karakter"),
});

export const forumReplyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

// ==========================================
// ORGANIZATION SCHEMAS
// ==========================================

export const createOrganizationSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(2000, "Deskripsi maksimal 2000 karakter").optional(),
  logo: z.string().url("URL logo tidak valid").optional(),
  banner: z.string().url("URL banner tidak valid").optional(),
  website: z.string().url("URL website tidak valid").optional(),
  location: z.string().max(100, "Lokasi maksimal 100 karakter").optional(),
  address: z.string().max(200).optional(),
  address1: z.string().max(200).optional(),
  address2: z.string().max(200).optional(),
  postalCode: z.string().max(10).optional(),
  kelurahan: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  industry: z.string().max(100, "Industri maksimal 100 karakter").optional(),
  country: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  instagram: z.string().max(100).optional(),
  contactEmail: z.string().email("Email tidak valid").optional(),
  contactPhone: z.string().max(20).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  categoryIds: z.array(z.string()).max(5, "Maksimal 5 kategori").optional(),
  tags: z.array(z.string().max(30)).max(10, "Maksimal 10 tag").optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const organizationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  categoryId: z.string().optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.enum(["createdAt", "name", "memberCount"]).default("createdAt"),
});

export const submitOrganizationSchema = z.object({});

export const updateOrganizationSettingsSchema = z.object({
  allowMemberPost: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  showMemberList: z.boolean().optional(),
  showEventList: z.boolean().optional(),
});

export const changeOrganizationMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

// ==========================================
// ORGANIZATION SUB-UPDATE SCHEMAS
// ==========================================

export const updateOrganizationProfileSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  address1: z.string().max(200).optional(),
  address2: z.string().max(200).optional(),
  postalCode: z.string().max(10).optional(),
  kelurahan: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  website: z.string().url("URL website tidak valid").optional().or(z.literal("")),
  industry: z.string().max(100).optional(),
  instagram: z.string().max(100).optional(),
  contactEmail: z.string().email("Email tidak valid").optional().or(z.literal("")),
  contactPhone: z.string().max(20).optional(),
});

export const updateOrganizationBannerSchema = z.object({
  banner: z.string().url("URL banner tidak valid").optional().or(z.literal("")),
});

export const updateOrganizationLogoSchema = z.object({
  logo: z.string().url("URL logo tidak valid").optional().or(z.literal("")),
});

// ==========================================
// EVENT SCHEMAS
// ==========================================

export const createEventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200, "Judul maksimal 200 karakter"),
  description: z.string().max(5000, "Deskripsi maksimal 5000 karakter").optional(),
  coverImage: z.string().url("URL cover image tidak valid").optional(),
  thumbnail: z.string().url("URL thumbnail tidak valid").optional(),
  location: z.string().max(200).optional(),
  locationType: z.enum(["OFFLINE", "ONLINE", "HYBRID"]).default("OFFLINE"),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().url("URL online tidak valid").optional(),
  meetingUrl: z.string().url("URL meeting tidak valid").optional(),
  eventDate: z.string().datetime("Format tanggal tidak valid"),
  endDate: z.string().datetime("Format tanggal tidak valid").optional(),
  timezone: z.string().default("Asia/Jakarta"),
  quota: z.number().int().min(1, "Kuota minimal 1"),
  allowWaitlist: z.boolean().default(false),
  registrationOpensAt: z.string().datetime("Format tanggal tidak valid").optional(),
  registrationDeadline: z.string().datetime("Format tanggal tidak valid").optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().email("Email tidak valid").optional(),
  contactPhone: z.string().max(20).optional(),
  communityId: z.string().optional(),
  organizationId: z.string().optional(),
  categoryIds: z.array(z.string()).max(5, "Maksimal 5 kategori").optional(),
  gallery: z.array(z.string().url()).max(10, "Maksimal 10 gambar").optional(),
  agendas: z
    .array(
      z.object({
        session: z.string().min(1, "Nama sesi wajib").max(200),
        description: z.string().max(2000).optional(),
        startTime: z.string().datetime("Format tanggal tidak valid").optional(),
        endTime: z.string().datetime("Format tanggal tidak valid").optional(),
        room: z.string().max(100).optional(),
        speakerName: z.string().max(200).optional(),
      })
    )
    .max(30, "Maksimal 30 sesi").optional(),
  speakers: z
    .array(
      z.object({
        name: z.string().min(1, "Nama pembicara wajib").max(200),
        photo: z.string().url("URL foto tidak valid").optional(),
        bio: z.string().max(2000).optional(),
        position: z.string().max(200).optional(),
        institution: z.string().max(200).optional(),
        socialMedia: z.string().max(500).optional(),
        topic: z.string().max(500).optional(),
        material: z.string().max(500).optional(),
      })
    )
    .max(30, "Maksimal 30 pembicara").optional(),
  tickets: z
    .array(
      z.object({
        name: z.string().min(1, "Nama tiket wajib").max(200),
        description: z.string().max(1000).optional(),
        price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
        quota: z.number().int().min(1).optional(),
      })
    )
    .max(10, "Maksimal 10 tiket").optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.preprocess(emptyToUndefined, z.string().optional()),
  status: z.preprocess(
    emptyToUndefined,
    z
      .enum([
        "DRAFT",
        "SUBMITTED",
        "IN_REVIEW",
        "REVISION_REQUESTED",
        "RESUBMITTED",
        "APPROVED",
        "PUBLISHED",
        "REGISTRATION_OPEN",
        "REGISTRATION_CLOSED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "ARCHIVED",
      ])
      .optional()
  ),
communityId: z.preprocess(emptyToUndefined, z.string().optional()),
  organizationId: z.preprocess(emptyToUndefined, z.string().optional()),
  categoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  locationType: z.preprocess(
    emptyToUndefined,
    z.enum(["OFFLINE", "ONLINE", "HYBRID"]).optional()
  ),
  upcoming: z.preprocess(emptyToUndefined, z.coerce.boolean().optional()),
  sort: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.enum(["createdAt", "eventDate", "title"]).default("eventDate"),
});

export const reviewEventSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "REQUEST_REVISION"]),
  note: z.string().max(5000).optional(),
}).superRefine((data, ctx) => {
  if (["REJECT", "REQUEST_REVISION"].includes(data.action) && !data.note?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Catatan reviewer wajib diisi", path: ["note"] });
  }
});

// ==========================================
// VOLUNTEER SCHEMAS
// ==========================================

export const volunteerPositionSchema = z.object({
  name: z.string().min(2, "Nama posisi minimal 2 karakter").max(100),
  description: z.string().max(1000).optional(),
  requiredQty: z.number().int().min(1, "Jumlah minimal 1").default(1),
  requirement: z.string().max(500).optional(),
});

export const createVolunteerOpportunitySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200),
  description: z.string().max(5000).optional(),
  eventId: z.string().min(1, "Event wajib dipilih"),
  registrationDeadline: z.string().datetime("Format tanggal tidak valid").optional(),
  briefingDate: z.string().datetime("Format tanggal tidak valid").optional(),
  activityStartDate: z.string().datetime("Format tanggal tidak valid").optional(),
  activityEndDate: z.string().datetime("Format tanggal tidak valid").optional(),
  positions: z.array(volunteerPositionSchema).min(1, "Minimal 1 posisi").max(20, "Maksimal 20 posisi"),
});

export const updateVolunteerOpportunitySchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  registrationDeadline: z.string().datetime().optional(),
  briefingDate: z.string().datetime().optional(),
  activityStartDate: z.string().datetime().optional(),
  activityEndDate: z.string().datetime().optional(),
  positions: z.array(volunteerPositionSchema.extend({ id: z.string().optional() })).min(1).max(20).optional(),
});

export const volunteerOpportunityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.preprocess(emptyToUndefined, z.string().optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum(["DRAFT", "PUBLISHED", "OPEN", "CLOSED", "ARCHIVED"]).optional()
  ),
  eventId: z.preprocess(emptyToUndefined, z.string().optional()),
  sort: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.enum(["createdAt", "title"]).default("createdAt"),
});

export const applyVolunteerSchema = z.object({
  positionId: z.string().min(1, "Posisi wajib dipilih"),
  motivation: z.string().min(10, "Motivasi minimal 10 karakter").max(2000),
  experience: z.string().max(2000).optional(),
  availability: z.string().max(500).optional(),
  agreement: z.literal(true, { errorMap: () => ({ message: "Persetujuan wajib dicentang" }) }),
});

export const reviewVolunteerApplicationSchema = z.object({
  action: z.enum(["ACCEPTED", "REJECTED"]),
  reviewNote: z.string().max(2000).optional(),
});

export const assignVolunteerSchema = z.object({
  picUserId: z.string().optional(),
  shiftStart: z.string().datetime("Format tanggal tidak valid").optional(),
  shiftEnd: z.string().datetime("Format tanggal tidak valid").optional(),
  notes: z.string().max(1000).optional(),
});

// ==========================================
// VOLUNTEER PROGRAM SCHEMAS
// ==========================================

const volunteerProgramFields = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(200),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(5000),
  location: z.string().min(2, "Lokasi wajib diisi").max(200),
  capacity: z.number().int().min(1, "Kuota minimal 1"),
  registrationDeadline: z.string().datetime("Format tanggal tidak valid").optional(),
  startDate: z.string().datetime("Format tanggal tidak valid"),
  endDate: z.string().datetime("Format tanggal tidak valid"),
});

export const createIndependentVolunteerProgramSchema = volunteerProgramFields;

export const createCommunityVolunteerProgramSchema = volunteerProgramFields.extend({
  communityId: z.string().min(1, "Komunitas wajib dipilih"),
});

export const updateVolunteerProgramSchema = volunteerProgramFields.partial();

export const reviewVolunteerProgramSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "REQUEST_REVISION"]),
  note: z.string().max(2000).optional(),
});

export const transitionVolunteerProgramSchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "REGISTRATION_OPEN",
    "REGISTRATION_CLOSED",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export const applyVolunteerProgramSchema = z.object({
  motivation: z.string().min(10, "Motivasi minimal 10 karakter").max(2000).optional(),
});

export const reviewVolunteerProgramApplicationSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT", "CANCEL"]),
  note: z.string().max(2000).optional(),
});

export const recordVolunteerProgramAttendanceSchema = z.object({
  attendance: z.enum(["ATTENDED", "NO_SHOW"]),
});

// ==========================================
// PAGINATION SCHEMA
// ==========================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.string().default("createdAt"),
});

// ==========================================
// REPORT SCHEMAS
// ==========================================

export const createReportSchema = z.object({
  targetType: z.enum(["COMMUNITY", "EVENT", "USER", "ORGANIZATION"]),
  targetId: z.string(),
  reason: z.enum([
    "SPAM",
    "HARASSMENT",
    "INAPPROPRIATE_CONTENT",
    "MISINFORMATION",
    "COPYRIGHT_VIOLATION",
    "OTHER",
  ]),
  description: z.string().max(2000).optional(),
});

// ==========================================
// ADMIN SCHEMAS
// ==========================================

export const adminActionNoteSchema = z.object({
  note: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
});

export const adminResolveReportSchema = z.object({
  action: z.enum(["DISMISSED", "SUSPENDED"]),
  note: z.string().max(2000).optional(),
});

export const adminBroadcastNotificationSchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(200),
  message: z.string().min(1, "Message wajib diisi").max(2000),
  type: z.enum(["SYSTEM", "COMMUNITY", "ORGANIZATION", "EVENT", "REPORT", "APPROVAL"]).optional(),
  targetRoles: z.array(z.enum(["SUPER_ADMIN", "PLATFORM_ADMIN", "MEMBER"])).optional(),
});

export const adminCreateCategorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50),
  description: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
  type: z.enum(["COMMUNITY", "ORGANIZATION", "EVENT", "VOLUNTEER"]).optional(),
});

export const adminUpdateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  type: z.enum(["COMMUNITY", "ORGANIZATION", "EVENT", "VOLUNTEER"]).optional(),
});

export const adminUpdateSettingSchema = z.object({
  value: z.unknown(),
});

export const adminUpdatePlatformGeneralSchema = z.record(z.unknown());

export const adminUpdateMasterDataSchema = z.object({
  data: z.array(z.string()),
});

export const forceLogoutSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi"),
  reason: z.string().min(1, "Alasan wajib diisi").max(500),
});

// ==========================================
// ADMIN CMS SCHEMAS
// ==========================================

export const adminCreateCmsPageSchema = z.object({
  slug: z.string().min(2, "Slug minimal 2 karakter").max(100).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  title: z.string().min(2, "Judul minimal 2 karakter").max(200),
  content: z.string().min(1, "Konten wajib diisi"),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(500).optional(),
  isPublished: z.boolean().default(false),
});

export const adminUpdateCmsPageSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  content: z.string().min(1).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(500).optional(),
  isPublished: z.boolean().optional(),
});

export const adminCreateBannerSchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter").max(200),
  imageUrl: z.string().url("URL gambar tidak valid"),
  linkUrl: z.string().url("URL link tidak valid").optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const adminUpdateBannerSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  imageUrl: z.string().url("URL gambar tidak valid").optional(),
  linkUrl: z.string().url("URL link tidak valid").optional().or(z.literal("")),
  position: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const adminResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
});

export const adminModerationWarningSchema = z.object({
  reason: z.string().min(1, "Alasan wajib diisi").max(2000, "Alasan maksimal 2000 karakter"),
});

// ==========================================
// ADMIN USER MANAGEMENT SCHEMAS
// ==========================================

export const adminUpdateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]),
  reason: z.string().max(2000, "Alasan maksimal 2000 karakter").optional(),
});

export const adminBulkActionSchema = z.object({
  ids: z.array(z.string()).min(1, "Minimal 1 item harus dipilih").max(100, "Maksimal 100 item per aksi"),
  action: z.enum(["DELETE", "SUSPEND", "ACTIVATE", "ARCHIVE", "RESTORE"]),
  reason: z.string().max(2000, "Alasan maksimal 2000 karakter").optional(),
});

// ==========================================
// ADMIN VOLUNTEER SCHEMAS
// ==========================================

export const adminReviewVolunteerSchema = z.object({
  action: z.enum(["ACCEPTED", "REJECTED"]),
  note: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
});

export const adminRejectVolunteerApplicationSchema = z.object({
  note: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
});

// ==========================================
// ADMIN EVENT SCHEMAS
// ==========================================

export const adminReviewEventSchema = z.object({
  action: z.enum(["PUBLISHED", "CANCELLED", "ARCHIVED"]),
  note: z.string().max(2000, "Catatan maksimal 2000 karakter").optional(),
});

// ==========================================
// ADMIN MASTER DATA SCHEMAS
// ==========================================

const masterDataStringArray = z.array(z.string().trim().min(1, "Item tidak boleh kosong").max(200)).max(500, "Maksimal 500 item");

export const adminUpdateMasterDataProvincesSchema = z.object({
  provinces: z.record(masterDataStringArray),
});

export const adminUpdateMasterDataCitiesSchema = z.object({
  cities: z.record(masterDataStringArray),
});

export const adminUpdateMasterDataCountriesSchema = z.object({
  countries: masterDataStringArray,
});

export const adminUpdateMasterDataInterestsSchema = z.object({
  interests: masterDataStringArray,
});

export const adminUpdateMasterDataDistrictsSchema = z.object({
  districts: z.record(masterDataStringArray),
});

export const adminUpdateMasterDataKelurahanSchema = z.object({
  kelurahan: z.record(masterDataStringArray),
});

export const adminUpdateMasterDataTagsSchema = z.object({
  tags: masterDataStringArray,
});

// ==========================================
// ADMIN NOTIFICATION TEMPLATE SCHEMAS
// ==========================================

export const adminCreateNotificationTemplateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter").trim(),
  title: z.string().min(1, "Judul wajib diisi").max(200, "Judul maksimal 200 karakter").trim(),
  message: z.string().min(1, "Pesan wajib diisi").max(2000, "Pesan maksimal 2000 karakter").trim(),
  type: z.enum(["SYSTEM", "COMMUNITY", "ORGANIZATION", "EVENT", "REPORT", "APPROVAL"]).optional(),
});

export const adminUpdateNotificationTemplateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  title: z.string().min(1).max(200).trim().optional(),
  message: z.string().min(1).max(2000).trim().optional(),
  type: z.enum(["SYSTEM", "COMMUNITY", "ORGANIZATION", "EVENT", "REPORT", "APPROVAL"]).optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// ADMIN SECURITY SCHEMAS
// ==========================================

export const adminForceLogoutSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi"),
});

export const adminLockUserSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi"),
});

export const adminUnlockUserSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi"),
});

export const adminSecuritySettingsSchema = z.object({
  maxLoginAttempts: z.number().int().min(1, "Minimal 1 percobaan").max(100, "Maksimal 100 percobaan").optional(),
  lockoutDurationMinutes: z.number().int().min(1, "Minimal 1 menit").max(1440, "Maksimal 1440 menit").optional(),
  sessionTimeoutMinutes: z.number().int().min(5, "Minimal 5 menit").max(10080, "Maksimal 7 hari").optional(),
  requirePasswordChange: z.boolean().optional(),
  enforceStrongPasswords: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  ipWhitelist: z.array(z.string().max(50)).max(100, "Maksimal 100 IP").optional(),
  ipBlacklist: z.array(z.string().max(50)).max(100, "Maksimal 100 IP").optional(),
});

// ==========================================
// ADMIN CMS CONTACT SCHEMAS
// ==========================================

const cmsContactFields = {
  companyName: z.string().min(1, "Nama perusahaan wajib diisi").max(200, "Nama perusahaan maksimal 200 karakter").trim(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  threads: z.string().max(100).optional(),
  website: z.string().url("URL website tidak valid").optional().or(z.literal("")),
  mapsUrl: z.string().url("URL maps tidak valid").optional().or(z.literal("")),
};

export const adminCreateCmsContactSchema = z.object(cmsContactFields);

export const adminUpdateCmsContactSchema = z.object({
  ...Object.fromEntries(Object.entries(cmsContactFields).map(([k, v]) => [k, (v as any).optional()])),
  isActive: z.boolean().optional(),
});

// ==========================================
// TYPE EXPORTS (APPEND)
// ==========================================

export type AdminCreateCmsPageInput = z.infer<typeof adminCreateCmsPageSchema>;
export type AdminUpdateCmsPageInput = z.infer<typeof adminUpdateCmsPageSchema>;
export type AdminCreateBannerInput = z.infer<typeof adminCreateBannerSchema>;
export type AdminUpdateBannerInput = z.infer<typeof adminUpdateBannerSchema>;
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;
export type AdminModerationWarningInput = z.infer<typeof adminModerationWarningSchema>;
export type AdminUpdateUserStatusInput = z.infer<typeof adminUpdateUserStatusSchema>;
export type AdminBulkActionInput = z.infer<typeof adminBulkActionSchema>;
export type AdminReviewVolunteerInput = z.infer<typeof adminReviewVolunteerSchema>;
export type AdminRejectVolunteerApplicationInput = z.infer<typeof adminRejectVolunteerApplicationSchema>;
export type AdminReviewEventInput = z.infer<typeof adminReviewEventSchema>;
export type AdminUpdateMasterDataProvincesInput = z.infer<typeof adminUpdateMasterDataProvincesSchema>;
export type AdminUpdateMasterDataCitiesInput = z.infer<typeof adminUpdateMasterDataCitiesSchema>;
export type AdminUpdateMasterDataCountriesInput = z.infer<typeof adminUpdateMasterDataCountriesSchema>;
export type AdminUpdateMasterDataInterestsInput = z.infer<typeof adminUpdateMasterDataInterestsSchema>;
export type AdminUpdateMasterDataDistrictsInput = z.infer<typeof adminUpdateMasterDataDistrictsSchema>;
export type AdminUpdateMasterDataKelurahanInput = z.infer<typeof adminUpdateMasterDataKelurahanSchema>;
export type AdminUpdateMasterDataTagsInput = z.infer<typeof adminUpdateMasterDataTagsSchema>;
export type AdminCreateNotificationTemplateInput = z.infer<typeof adminCreateNotificationTemplateSchema>;
export type AdminUpdateNotificationTemplateInput = z.infer<typeof adminUpdateNotificationTemplateSchema>;
export type AdminForceLogoutInput = z.infer<typeof adminForceLogoutSchema>;
export type AdminLockUserInput = z.infer<typeof adminLockUserSchema>;
export type AdminUnlockUserInput = z.infer<typeof adminUnlockUserSchema>;
export type AdminSecuritySettingsInput = z.infer<typeof adminSecuritySettingsSchema>;
export type AdminCreateCmsContactInput = z.infer<typeof adminCreateCmsContactSchema>;
export type AdminUpdateCmsContactInput = z.infer<typeof adminUpdateCmsContactSchema>;

// ==========================================
// TYPE EXPORTS
// ==========================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type OrganizationQueryInput = z.infer<typeof organizationQuerySchema>;
export type SubmitOrganizationInput = z.infer<typeof submitOrganizationSchema>;
export type UpdateOrganizationSettingsInput = z.infer<typeof updateOrganizationSettingsSchema>;
export type ChangeOrganizationMemberRoleInput = z.infer<typeof changeOrganizationMemberRoleSchema>;
export type UpdateOrganizationProfileInput = z.infer<typeof updateOrganizationProfileSchema>;
export type UpdateOrganizationBannerInput = z.infer<typeof updateOrganizationBannerSchema>;
export type UpdateOrganizationLogoInput = z.infer<typeof updateOrganizationLogoSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateInterestsInput = z.infer<typeof updateInterestsSchema>;
export type JoinCommunityInput = z.infer<typeof joinCommunitySchema>;
export type HandleJoinRequestInput = z.infer<typeof handleJoinRequestSchema>;
export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UpdateCommunitySettingsInput = z.infer<typeof updateCommunitySettingsSchema>;
export type UpdateCommunityProfileInput = z.infer<typeof updateCommunityProfileSchema>;
export type UpdateCommunityBannerInput = z.infer<typeof updateCommunityBannerSchema>;
export type UpdateCommunityLogoInput = z.infer<typeof updateCommunityLogoSchema>;
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
export type CommunityQueryInput = z.infer<typeof communityQuerySchema>;
export type SubmitCommunityInput = z.infer<typeof submitCommunitySchema>;
export type AdminReviewCommunityInput = z.infer<typeof adminReviewCommunitySchema>;
export type SuspendCommunityInput = z.infer<typeof suspendCommunitySchema>;
export type CreateCommunityMediaInput = z.infer<typeof createCommunityMediaSchema>;
export type UpdateCommunityMediaInput = z.infer<typeof updateCommunityMediaSchema>;
export type CommunityMediaQueryInput = z.infer<typeof communityMediaQuerySchema>;
export type CreateVolunteerOpportunityInput = z.infer<typeof createVolunteerOpportunitySchema>;
export type UpdateVolunteerOpportunityInput = z.infer<typeof updateVolunteerOpportunitySchema>;
export type VolunteerOpportunityQueryInput = z.infer<typeof volunteerOpportunityQuerySchema>;
export type ApplyVolunteerInput = z.infer<typeof applyVolunteerSchema>;
export type ReviewVolunteerApplicationInput = z.infer<typeof reviewVolunteerApplicationSchema>;
export type AssignVolunteerInput = z.infer<typeof assignVolunteerSchema>;
export type AdminActionNoteInput = z.infer<typeof adminActionNoteSchema>;
export type AdminResolveReportInput = z.infer<typeof adminResolveReportSchema>;
export type AdminBroadcastNotificationInput = z.infer<typeof adminBroadcastNotificationSchema>;
export type AdminCreateCategoryInput = z.infer<typeof adminCreateCategorySchema>;
export type AdminUpdateCategoryInput = z.infer<typeof adminUpdateCategorySchema>;
export type AdminUpdateSettingInput = z.infer<typeof adminUpdateSettingSchema>;

// ==========================================
// CONTACT MESSAGE SCHEMA
// ==========================================

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid"),
  subject: z.string().min(3, "Subjek minimal 3 karakter").max(200),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(5000),
  category: z.enum(["GENERAL", "FEEDBACK", "COMPLAINT", "SUGGESTION", "PARTNERSHIP", "OTHER"]).default("GENERAL"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
