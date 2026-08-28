// Shared types for the community dashboard shell and its per-tab modules.
// Kept together here because the shell (community-dashboard-route.tsx) owns all
// fetching/state and passes these shapes down as props to every tab component.

export interface DashboardData {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    visibility: string;
    membershipType: string;
    status: string;
    memberCount: number;
    eventCount: number;
    createdAt: string;
  };
  pendingRequests: number;
  activeEvents: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
  details: unknown | null;
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string | null;
  role: string;
  status?: string;
  joinedAt: string;
}

export interface MemberResponseItem {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  role: string;
  status: string;
  joinedAt: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

export interface InsightData {
  totalMembers: number;
  pendingRequests: number;
  memberGrowthRate: number;
  memberGrowthCount: number;
  topMembers: { role: string; count: number }[];
}

export type Tab = "ringkasan" | "profil" | "pengurus" | "anggota" | "permintaan" | "media" | "pengaturan" | "insight" | "event";

export const tabs: { key: Tab; label: string }[] = [
  { key: "ringkasan", label: "Ringkasan" },
  { key: "profil", label: "Profil Komunitas" },
  { key: "event", label: "Event" },
  { key: "pengurus", label: "Pengurus" },
  { key: "anggota", label: "Anggota" },
  { key: "permintaan", label: "Permintaan" },
  { key: "media", label: "Media" },
  { key: "pengaturan", label: "Pengaturan" },
  { key: "insight", label: "Insight" },
];

// Shared across AnggotaTab, PengurusTab and InsightTab.
export const roleBadge: Record<string, string> = {
  OWNER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-amber-100 text-amber-700",
  EVENT_MANAGER: "bg-blue-100 text-blue-700",
  VOLUNTEER_COORDINATOR: "bg-teal-100 text-teal-700",
  MEMBER: "bg-gray-100 text-gray-600",
};

export interface PengaturanForm {
  name: string;
  description: string;
  visibility: string;
  membershipType: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  address2: string;
  country: string;
  website: string;
  banner: string;
  logo: string;
  categoryIds: string[];
  tagsInput: string;
}

export interface CommunitySettingsToggles {
  allowMemberPost: boolean;
  requireApproval: boolean;
  showMemberList: boolean;
  showEventList: boolean;
}
