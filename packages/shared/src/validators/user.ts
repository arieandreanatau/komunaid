import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().optional(),
});

export const InterestSelectionSchema = z.object({
  interests: z.array(z.string()).min(1, 'Select at least one interest').max(20),
});

export const UpdateUserAdminSchema = z.object({
  isActive: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  suspendedReason: z.string().max(500).optional(),
});

export const RoleAssignmentSchema = z.object({
  userId: z.string().uuid(),
  roleName: z.enum([
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'ORG_OWNER',
    'ORG_ADMIN',
    'COMMUNITY_OWNER',
    'COMMUNITY_ADMIN',
    'EVENT_MANAGER',
    'MEMBER',
  ]),
  scopeId: z.string().uuid().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type InterestSelectionInput = z.infer<typeof InterestSelectionSchema>;
