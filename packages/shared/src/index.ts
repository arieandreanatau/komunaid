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
    token: z.string(),
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
  name: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  coverImage: z.string().url().optional(),
  logo: z.string().url().optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  membershipType: z.enum(["OPEN", "RESTRICTED"]).default("OPEN"),
});

export const updateCommunitySchema = createCommunitySchema.partial();

// ==========================================
// ORGANIZATION SCHEMAS
// ==========================================

export const createOrganizationSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

// ==========================================
// EVENT SCHEMAS
// ==========================================

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  coverImage: z.string().url().optional(),
  location: z.string().max(200).optional(),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().url().optional(),
  eventDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  quota: z.number().int().min(1, "Kuota minimal 1"),
  communityId: z.string().optional(),
  organizationId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const updateEventSchema = createEventSchema.partial();

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
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateInterestsInput = z.infer<typeof updateInterestsSchema>;
