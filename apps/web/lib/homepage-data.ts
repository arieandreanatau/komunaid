export interface HomepageCommunity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  logo: string | null;
  banner: string | null;
  location: string | null;
  province: string | null;
  city: string | null;
  membershipType: string;
  status: string;
  visibility: string;
  owner: { id: string; name: string; avatar: string | null } | null;
  memberCount: number;
  eventCount: number;
  categories: { id: string; name: string }[];
  tags: { id: string; tag: string }[];
  createdAt: string;
}

export interface HomepageEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  thumbnail: string | null;
  eventDate: string;
  location: string | null;
  locationType: "OFFLINE" | "ONLINE" | "HYBRID";
  quota: number;
  registeredCount: number;
  status: string;
  community: { name: string; slug: string } | null;
  organization: { name: string; slug: string } | null;
}

export interface HomepageVolunteer {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  registrationDeadline: string | null;
  activityStartDate: string | null;
  applicationCount: number;
  positions?: { id: string; name: string; requiredQty: number }[];
  event: {
    title: string;
    slug: string;
    eventDate: string;
    location: string | null;
    locationType?: "OFFLINE" | "ONLINE" | "HYBRID";
    community?: { name: string; slug: string } | null;
  };
}