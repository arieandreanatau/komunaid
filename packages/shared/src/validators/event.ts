import { z } from 'zod';

export const CreateEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Event title must be at least 3 characters')
    .max(200, 'Event title must not exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description must not exceed 10000 characters'),
  shortDescription: z
    .string()
    .max(300, 'Short description must not exceed 300 characters')
    .optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().max(300).optional(),
  locationUrl: z.string().url().max(500).optional().or(z.literal('')),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().url().max(500).optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  capacity: z.number().int().min(1).max(100000).optional(),
  registrationDeadline: z.string().optional(),
  communityId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
});

export const UpdateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(10000).optional(),
  shortDescription: z.string().max(300).optional(),
  banner: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().max(300).optional(),
  locationUrl: z.string().url().max(500).optional().or(z.literal('')),
  isOnline: z.boolean().optional(),
  onlineUrl: z.string().url().max(500).optional().or(z.literal('')),
  category: z.string().optional(),
  capacity: z.number().int().min(1).max(100000).optional(),
  registrationDeadline: z.string().optional(),
});

export const EventQuerySchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']).optional(),
  isOnline: z.coerce.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  communityId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['newest', 'oldest', 'date', 'popular']).default('date'),
});

export const EventStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().max(500).optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type EventQueryInput = z.infer<typeof EventQuerySchema>;
