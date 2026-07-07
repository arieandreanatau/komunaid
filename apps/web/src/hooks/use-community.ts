import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
  website: string | null;
  memberCount: number;
  category: Category | null;
  isMember: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  members?: Array<{
    id: string;
    user: { id: string; firstName: string; lastName: string; avatar: string | null };
    role: string;
    status: string;
  }>;
  posts?: Array<{
    id: string;
    content: string;
    author: { firstName: string; lastName: string };
    createdAt: string;
  }>;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateCommunityPayload {
  name: string;
  description?: string;
  location?: string;
  website?: string;
  categoryId?: string;
  logo?: string;
  banner?: string;
}

type UpdateCommunityPayload = Partial<CreateCommunityPayload>;

interface ApproveRejectPayload {
  memberId: string;
}

export function useCommunities(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: ['communities', params],
    queryFn: () =>
      api.get<PaginatedResponse<Community>>('/communities', { params }).then((r) => r.data.data),
  });
}

export function useCommunity(slug: string) {
  return useQuery({
    queryKey: ['community', slug],
    queryFn: () => api.get<{ data: Community }>(`/communities/${slug}`).then((r) => r.data.data),
    enabled: !!slug,
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommunityPayload) =>
      api.post<{ data: Community }>('/communities', data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useUpdateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommunityPayload }) =>
      api.patch<{ data: Community }>(`/communities/${id}`, data).then((r) => r.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (communityId: string) =>
      api.post(`/communities/${communityId}/join`).then((r) => r.data.data),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (communityId: string) =>
      api.post(`/communities/${communityId}/leave`).then((r) => r.data.data),
    onSuccess: (_, communityId) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useApproveCommunityMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, memberId }: { communityId: string; memberId: string }) =>
      api.post(`/communities/${communityId}/members/${memberId}/approve`).then((r) => r.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useRejectCommunityMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, memberId }: { communityId: string; memberId: string }) =>
      api.post(`/communities/${communityId}/members/${memberId}/reject`).then((r) => r.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}
