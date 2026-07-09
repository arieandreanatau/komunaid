import type { AuthUser } from "../middleware/auth";

export type Variables = {
  user: AuthUser;
  validated: Record<string, unknown>;
  userRoles: string[];
};
