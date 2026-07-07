import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalCommunities: number;
  totalEvents: number;
  totalOrganizations: number;
  pendingApprovals: number;
  pendingReports: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
  isActive: boolean;
  roles: Array<{ name: string; scope?: string | null; scopeId?: string | null }>;
  createdAt: string;
}

interface AdminCommunity {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  status: string;
  createdAt: string;
}

interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  status: string;
  createdAt: string;
}

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  status: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  user: { firstName: string; lastName: string };
  details: Record<string, unknown>;
  createdAt: string;
}

interface AdminSettings {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  [key: string]: unknown;
}

interface Report {
  id: string;
  type: string;
  reason: string;
  status: string;
  reporterId: string;
  reporter: { firstName: string; lastName: string };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
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

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () =>
      api.get<{ data: DashboardStats }>('/admin/dashboard/stats').then((r) => r.data.data),
  });
}

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () =>
      api.get<PaginatedResponse<AdminUser>>('/admin/users', { params }).then((r) => r.data.data),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      api.patch(`/admin/users/${userId}/suspend`, { reason }).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleName,
      scope,
      scopeId,
    }: {
      userId: string;
      roleName: string;
      scope?: string;
      scopeId?: string;
    }) =>
      api
        .post('/admin/roles/assign', { userId, roleName, scope, scopeId })
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
}) {
  return useQuery({
    queryKey: ['admin-audit-logs', params],
    queryFn: () =>
      api
        .get<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params })
        .then((r) => r.data.data),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.get<{ data: AdminSettings }>('/admin/settings').then((r) => r.data.data),
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AdminSettings>) =>
      api.patch<{ data: AdminSettings }>('/admin/settings', data).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-settings'], data);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
  });
}

export function useAdminCommunities(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['admin-communities', params],
    queryFn: () =>
      api
        .get<PaginatedResponse<AdminCommunity>>('/communities', { params })
        .then((r) => r.data.data),
  });
}

export function useAdminOrganizations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['admin-organizations', params],
    queryFn: () =>
      api
        .get<PaginatedResponse<AdminOrganization>>('/organizations', { params })
        .then((r) => r.data.data),
  });
}

export function useAdminEvents(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['admin-events', params],
    queryFn: () =>
      api.get<PaginatedResponse<AdminEvent>>('/events', { params }).then((r) => r.data.data),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get<{ data: Category[] }>('/categories').then((r) => r.data.data),
  });
}

export function useAdminReports(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['admin-reports', params],
    queryFn: () =>
      api.get<PaginatedResponse<Report>>('/reports', { params }).then((r) => r.data.data),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, resolution }: { reportId: string; resolution: string }) =>
      api.patch(`/reports/${reportId}/resolve`, { resolution }).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
}
