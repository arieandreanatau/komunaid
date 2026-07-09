export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const APP_NAME = "KomunaID";
export const APP_URL = "https://komuna.id";
export const API_URL = "https://api.komuna.id";
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword"];
export const CACHE_TTL = 60 * 1000;
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
export const RATE_LIMIT_MAX = 100;

// ==========================================
// AUTH CONSTANTS
// ==========================================

export const BCRYPT_ROUNDS = 12;
export const JWT_ACCESS_EXPIRY = "15m";
export const JWT_REFRESH_EXPIRY = "30d";
export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const MAX_INTERESTS = 20;

// ==========================================
// ROLE CONSTANTS
// ==========================================

export const PLATFORM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  MEMBER: "MEMBER",
} as const;

export const COMMUNITY_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  EVENT_MANAGER: "EVENT_MANAGER",
  MEMBER: "MEMBER",
} as const;

export const ORGANIZATION_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

// ==========================================
// STATUS CONSTANTS
// ==========================================

export const USER_STATUSES = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DEACTIVATED: "DEACTIVATED",
} as const;

export const COMMUNITY_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  SUSPENDED: "SUSPENDED",
  ARCHIVED: "ARCHIVED",
} as const;

export const EVENT_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  SUSPENDED: "SUSPENDED",
} as const;

export const NOTIFICATION_TYPES = {
  SYSTEM: "SYSTEM",
  COMMUNITY: "COMMUNITY",
  EVENT: "EVENT",
  REPORT: "REPORT",
  APPROVAL: "APPROVAL",
} as const;
