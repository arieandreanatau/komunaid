import type { AuthUser } from "../middleware/auth";
import type { CommunityRole } from "@komunaid/shared";

export type Variables = {
  user: AuthUser;
  validated: Record<string, unknown>;
  userRoles: string[];
  /**
   * The viewer's resolved community membership role, stashed by
   * requireCommunityOfficer (middleware/rbac.ts) so a route guarded by it
   * can read the real role without a second membership query.
   */
  communityRole: CommunityRole | null;
};
