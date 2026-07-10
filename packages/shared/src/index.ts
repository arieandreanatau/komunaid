import { z } from "zod";

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
    password: z.string().min(8, "Password minimal 8 karakter"),
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
  email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token wajib diisi"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
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
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
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
  country: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
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
  role: z.enum(["ADMIN", "EVENT_MANAGER", "MEMBER"]),
});

export const communityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  membershipType: z.enum(["OPEN", "RESTRICTED"]).optional(),
  categoryId: z.string().optional(),
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
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().email("Email tidak valid").optional(),
  contactPhone: z.string().max(20).optional(),
  communityId: z.string().optional(),
  organizationId: z.string().optional(),
  categoryIds: z.array(z.string()).max(5, "Maksimal 5 kategori").optional(),
  gallery: z.array(z.string().url()).max(10, "Maksimal 10 gambar").optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  communityId: z.string().optional(),
  organizationId: z.string().optional(),
  upcoming: z.coerce.boolean().optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  orderBy: z.enum(["createdAt", "eventDate", "title"]).default("eventDate"),
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
  search: z.string().optional(),
  status: z.string().optional(),
  eventId: z.string().optional(),
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
export type CreateVolunteerOpportunityInput = z.infer<typeof createVolunteerOpportunitySchema>;
export type UpdateVolunteerOpportunityInput = z.infer<typeof updateVolunteerOpportunitySchema>;
export type VolunteerOpportunityQueryInput = z.infer<typeof volunteerOpportunityQuerySchema>;
export type ApplyVolunteerInput = z.infer<typeof applyVolunteerSchema>;
export type ReviewVolunteerApplicationInput = z.infer<typeof reviewVolunteerApplicationSchema>;
export type AssignVolunteerInput = z.infer<typeof assignVolunteerSchema>;
