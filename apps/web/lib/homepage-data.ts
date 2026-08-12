export interface HomepageCommunity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  logo: string | null;
  location: string | null;
  memberCount: number;
  categories: { id: string; name: string }[];
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
  event: {
    title: string;
    slug: string;
    eventDate: string;
    location: string | null;
    locationType?: "OFFLINE" | "ONLINE" | "HYBRID";
    community?: { name: string; slug: string } | null;
  };
}
