import { z } from 'zod';

export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(3, 'Organization name must be at least 3 characters')
    .max(200, 'Organization name must not exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  shortDescription: z
    .string()
    .max(300, 'Short description must not exceed 300 characters')
    .optional(),
  industry: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  website: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  foundedAt: z.string().optional(),
  size: z.string().max(50).optional(),
});

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  shortDescription: z.string().max(300).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  industry: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  website: z.string().url().max(500).optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  foundedAt: z.string().optional(),
  size: z.string().max(50).optional(),
});

export const OrganizationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().max(500).optional(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
