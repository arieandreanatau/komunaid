export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  emailVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  suspendedAt: Date | null;
  suspendedReason: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserProfile extends Omit<User, 'email'> {
  communitiesCount?: number;
  eventsCount?: number;
  roles?: UserRoleAssignment[];
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  grantedById: string | null;
  grantedAt: Date;
  scope: RoleScope | null;
  scopeId: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
}

export type RoleScope = 'COMMUNITY' | 'ORGANIZATION' | 'PLATFORM';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar?: string;
}

export interface InterestSelection {
  interests: string[];
}
