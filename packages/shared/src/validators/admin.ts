import { z } from 'zod';

export const AdminUserQuerySchema = z.object({
  search: z.string().max(200).optional(),
  isActive: z.coerce.boolean().optional(),
  isSuspended: z.coerce.boolean().optional(),
  roleId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['newest', 'oldest', 'name', 'email']).default('newest'),
});

export const AuditLogQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const DashboardQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

export const UpdateSettingsSchema = z.object({
  platformName: z.string().max(100).optional(),
  platformDescription: z.string().max(500).optional(),
  maintenanceMode: z.boolean().optional(),
  allowRegistration: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
});

export type AdminUserQueryInput = z.infer<typeof AdminUserQuerySchema>;
export type AuditLogQueryInput = z.infer<typeof AuditLogQuerySchema>;
