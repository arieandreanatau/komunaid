import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://komuna.id";

async function fetchSlugs(endpoint: string): Promise<string[]> {
  try {
    const apiUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/api/v1/${endpoint}?limit=500`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.data || data.communities || data.events || data.organizations || [];
    return items.map((item: { slug?: string }) => item.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/community-guidelines`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/event-guidelines`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/volunteer-guidelines`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/communities`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/organizations`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/volunteer`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  const [communitySlugs, eventSlugs, orgSlugs, volSlugs] = await Promise.all([
    fetchSlugs("communities"),
    fetchSlugs("events"),
    fetchSlugs("organizations"),
    fetchSlugs("volunteer"),
  ]);

  const dynamicPages: MetadataRoute.Sitemap = [
    ...communitySlugs.map((slug) => ({
      url: `${BASE_URL}/communities/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...eventSlugs.map((slug) => ({
      url: `${BASE_URL}/events/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...orgSlugs.map((slug) => ({
      url: `${BASE_URL}/organizations/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...volSlugs.map((slug) => ({
      url: `${BASE_URL}/volunteer/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...dynamicPages];
}
