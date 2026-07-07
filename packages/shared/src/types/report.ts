export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  resolvedAt: Date | null;
  resolvedById: string | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
  reporter?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export type ReportTargetType = 'USER' | 'COMMUNITY' | 'EVENT' | 'ORGANIZATION' | 'POST';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string;
}

export interface ResolveReportInput {
  status: 'RESOLVED' | 'DISMISSED';
  resolution: string;
}
