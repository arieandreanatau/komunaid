export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export type NotificationType =
  'SYSTEM' | 'APPROVAL' | 'REJECTION' | 'EVENT' | 'COMMUNITY' | 'MODERATION';
