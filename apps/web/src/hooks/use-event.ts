import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Organizer {
  id: string;
  name: string;
  type: string;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  banner: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  capacity: number | null;
  category: Category | null;
  organizer: Organizer | null;
  isRegistered: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateEventPayload {
  title: string;
  description?: string;
  banner?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  capacity?: number;
  categoryId?: string;
}

type UpdateEventPayload = Partial<CreateEventPayload>;

export function useEvents(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () =>
      api.get<PaginatedResponse<Event>>('/events', { params }).then((r) => r.data.data),
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.get<{ data: Event }>(`/events/${slug}`).then((r) => r.data.data),
    enabled: !!slug,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventPayload) =>
      api.post<{ data: Event }>('/events', data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventPayload }) =>
      api.patch<{ data: Event }>(`/events/${id}`, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      api.post(`/events/${eventId}/register`).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}

export function useUnregisterEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      api.post(`/events/${eventId}/unregister`).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
    },
  });
}
