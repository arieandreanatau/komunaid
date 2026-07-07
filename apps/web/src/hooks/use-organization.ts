import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
  website: string | null;
  memberCount: number;
  isMember: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateOrganizationPayload {
  name: string;
  description?: string;
  location?: string;
  website?: string;
  logo?: string;
  banner?: string;
}

type UpdateOrganizationPayload = Partial<CreateOrganizationPayload>;

export function useOrganizations(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: () =>
      api
        .get<PaginatedResponse<Organization>>('/organizations', { params })
        .then((r) => r.data.data),
  });
}

export function useOrganization(slug: string) {
  return useQuery({
    queryKey: ['organization', slug],
    queryFn: () =>
      api.get<{ data: Organization }>(`/organizations/${slug}`).then((r) => r.data.data),
    enabled: !!slug,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationPayload) =>
      api.post<{ data: Organization }>('/organizations', data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationPayload }) =>
      api.patch<{ data: Organization }>(`/organizations/${id}`, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
}

export function useJoinOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      api.post(`/organizations/${organizationId}/join`).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      api.post(`/organizations/${organizationId}/leave`).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });
}
