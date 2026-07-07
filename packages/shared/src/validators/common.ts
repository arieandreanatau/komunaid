import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const SlugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
});

export const ReportSchema = z.object({
  targetType: z.enum(['USER', 'COMMUNITY', 'EVENT', 'ORGANIZATION', 'POST']),
  targetId: z.string().uuid(),
  reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(200, 'Reason must not exceed 200 characters'),
  description: z.string().max(2000).optional(),
});

export const ResolveReportSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
  resolution: z.string().min(5, 'Resolution must be at least 5 characters').max(2000),
});

export const CreateContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['COMMUNITY', 'EVENT', 'ORGANIZATION']),
  parentId: z.string().uuid().optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
export type CreateReportInput = z.infer<typeof ReportSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
