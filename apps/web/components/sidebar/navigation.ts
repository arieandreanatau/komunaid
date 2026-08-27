export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  permission?: string[];
}

export interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}

const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  EVENT_MANAGER: 2,
  VOLUNTEER_COORDINATOR: 2,
  OFFICER: 2,
  MEMBER: 1,
};

function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true;
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  return requiredRoles.some((role) => userLevel >= (ROLE_HIERARCHY[role] ?? 0));
}

export function filterByPermission(items: NavItem[], userRole: string): NavItem[] {
  return items.filter((item) => !item.permission || hasPermission(userRole, item.permission));
}

const ICONS = {
  overview: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  profile: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  interests: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.958c.3.921-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.197-1.539-1.118l1.286-3.958a1 1 0 00-.364-1.118L4.06 9.385c-.783-.57-.38-1.81.588-1.81H8.81a1 1 0 00.951-.69l1.287-3.958z",
  communities: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  submissions: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  bookmark: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z",
  event: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  eventHistory: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  volunteer: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  volunteerPropose: "M12 4v16m8-8H4",
  notification: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  message: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  privacy: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  preferences: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  members: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  media: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  insight: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  finance: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  backToPersonal: "M11 17l-5-5m0 0l5-5m-5 5h12",
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  blacklist: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  add: "M12 4v16m8-8H4",
  communityProfile: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  myProfile: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  people: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  posting: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
};

export function getPersonalNavigation(): NavSection[] {
  return [
    {
      id: "personal",
      label: "Personal",
      items: [
        { href: "/dashboard", label: "Overview", icon: ICONS.overview },
        { href: "/dashboard/profile", label: "Profil", icon: ICONS.profile },
        { href: "/dashboard/interests", label: "Minat", icon: ICONS.interests },
      ],
    },
    {
      id: "komunitas",
      label: "Komunitas",
      items: [
        { href: "/dashboard/communities", label: "Komunitas Saya", icon: ICONS.communities },
        { href: "/dashboard/my-submissions", label: "Pengajuan Komunitas", icon: ICONS.submissions },
      ],
    },
    {
      id: "event",
      label: "Event",
      items: [
        { href: "/dashboard/events", label: "Event", icon: ICONS.event },
        { href: "/dashboard/events/history", label: "Riwayat Event", icon: ICONS.eventHistory },
      ],
    },
    {
      id: "volunteer",
      label: "Volunteer",
      items: [
        { href: "/dashboard/volunteers", label: "Volunteer Saya", icon: ICONS.volunteer },
        { href: "/dashboard/volunteers/propose", label: "Ajukan Program", icon: ICONS.volunteerPropose },
      ],
    },
    {
      id: "komunikasi",
      label: "Komunikasi",
      items: [
        { href: "/dashboard/notifications", label: "Notifikasi", icon: ICONS.notification },
      ],
    },
    {
      id: "pengaturan",
      label: "Pengaturan",
      items: [
        { href: "/dashboard/settings", label: "Akun", icon: ICONS.settings },
        { href: "/dashboard/settings/privacy", label: "Privasi", icon: ICONS.privacy },
        { href: "/dashboard/settings/preferences", label: "Preferensi", icon: ICONS.preferences },
      ],
    },
  ];
}

export function getCommunityNavigation(communityId: string, role: string): NavSection[] {
  const base = `/dashboard/communities/${communityId}`;

  const sections: NavSection[] = [
    {
      id: "community",
      label: "Community",
      items: [
        { href: `${base}/overview`, label: "Overview", icon: ICONS.overview },
        { href: `${base}/profile`, label: "Profil Komunitas", icon: ICONS.communityProfile },
        { href: `${base}/requests`, label: "Permintaan", icon: ICONS.submissions, permission: ["OWNER", "ADMIN", "OFFICER"] },
      ],
    },
    {
      id: "activity-engine",
      label: "Activity Engine",
      items: [
        { href: `${base}/events`, label: "Event", icon: ICONS.event },
        { href: `${base}/volunteer`, label: "Volunteer", icon: ICONS.volunteer },
      ],
    },
    {
      id: "people",
      label: "People",
      items: [
        { href: `${base}/pengurus`, label: "Pengurus", icon: ICONS.people, permission: ["OWNER", "ADMIN", "OFFICER"] },
        { href: `${base}/members`, label: "Anggota", icon: ICONS.members },
      ],
    },
    {
      id: "content",
      label: "Community Content",
      items: [
        { href: `${base}/media`, label: "Media", icon: ICONS.media, permission: ["OWNER", "ADMIN", "OFFICER"] },
        { href: `${base}/insights`, label: "Aktivitas", icon: ICONS.insight, permission: ["OWNER", "ADMIN"] },
      ],
    },
    {
      id: "communication",
      label: "Communication",
      items: [
        { href: "/dashboard/notifications", label: "Notifikasi", icon: ICONS.notification },
      ],
    },
    {
      id: "management",
      label: "Management",
      items: [
        { href: `${base}/settings`, label: "Pengaturan", icon: ICONS.settings, permission: ["OWNER", "ADMIN"] },
      ],
    },
  ];

  return sections.map((section) => ({
    ...section,
    items: filterByPermission(section.items, role),
  })).filter((section) => section.items.length > 0);
}

export function getSupportingNavigation(): NavSection[] {
  return [
    {
      id: "komunikasi",
      label: "Komunikasi",
      items: [
        { href: "/dashboard/notifications", label: "Notifikasi", icon: ICONS.notification },
      ],
    },
  ];
}

export function getCommunitySupportingNavigation(): NavSection[] {
  return [
    {
      id: "komunikasi",
      items: [
        { href: "/dashboard/notifications", label: "Notifikasi", icon: ICONS.notification },
      ],
    },
    {
      id: "personal-link",
      items: [
        { href: "/dashboard", label: "Kembali ke Personal", icon: ICONS.backToPersonal },
      ],
    },
  ];
}

export { ICONS };
