export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  message: string;
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
}

export type ContactMessageStatus = 'UNREAD' | 'READ' | 'REPLIED';

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCommunities: number;
  totalOrganizations: number;
  totalEvents: number;
  pendingApprovals: number;
  activeReports: number;
  recentRegistrations: number;
  recentCommunities: number;
}
