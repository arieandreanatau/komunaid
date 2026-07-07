import { z } from 'zod';

export const CreateCommunitySchema = z.object({
  name: z
    .string()
    .min(3, 'Community name must be at least 3 characters')
    .max(200, 'Community name must not exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  shortDescription: z
    .string()
    .max(300, 'Short description must not exceed 300 characters')
    .optional(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().max(200).optional(),
  website: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
  membershipType: z.enum(['OPEN', 'REQUEST', 'INVITE_ONLY', 'CLOSED']),
  maxMembers: z.number().int().min(1).max(100000).optional(),
});

export const UpdateCommunitySchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  shortDescription: z.string().max(300).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  category: z.string().optional(),
  location: z.string().max(200).optional(),
  website: z.string().url().max(500).optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
  membershipType: z.enum(['OPEN', 'REQUEST', 'INVITE_ONLY', 'CLOSED']).optional(),
  maxMembers: z.number().int().min(1).max(100000).optional(),
});

export const CommunityQuerySchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED']).optional(),
  membershipType: z.enum(['OPEN', 'REQUEST', 'INVITE_ONLY', 'CLOSED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['newest', 'oldest', 'name', 'members']).default('newest'),
});

export const CommunityStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().max(500).optional(),
});

export type CreateCommunityInput = z.infer<typeof CreateCommunitySchema>;
export type UpdateCommunityInput = z.infer<typeof UpdateCommunitySchema>;
export type CommunityQueryInput = z.infer<typeof CommunityQuerySchema>;
