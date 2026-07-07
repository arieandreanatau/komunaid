export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOC_TYPES: ['application/pdf'],
  MAX_AVATAR_SIZE_MB: 2,
  MAX_BANNER_SIZE_MB: 5,
} as const;

export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  SALT_ROUNDS: 12,
} as const;

export const USERNAME = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 30,
  PATTERN: /^[a-zA-Z0-9_-]+$/,
} as const;

export const SLUG = {
  PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  MAX_LENGTH: 200,
} as const;

export const SEARCH = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 200,
} as const;

export const DEFAULT_CATEGORIES = {
  COMMUNITY: [
    { name: 'Technology', slug: 'technology', description: 'Tech-related communities' },
    { name: 'Business', slug: 'business', description: 'Business & entrepreneurship' },
    { name: 'Design', slug: 'design', description: 'Design & creative' },
    { name: 'Education', slug: 'education', description: 'Education & learning' },
    { name: 'Health', slug: 'health', description: 'Health & wellness' },
    { name: 'Social', slug: 'social', description: 'Social & community' },
    { name: 'Creative', slug: 'creative', description: 'Creative arts & culture' },
    { name: 'Sports', slug: 'sports', description: 'Sports & fitness' },
  ],
  EVENT: [
    { name: 'Workshop', slug: 'workshop', description: 'Hands-on learning sessions' },
    { name: 'Meetup', slug: 'meetup', description: 'Casual community gatherings' },
    { name: 'Conference', slug: 'conference', description: 'Large-scale conferences' },
    { name: 'Webinar', slug: 'webinar', description: 'Online seminars' },
    { name: 'Hackathon', slug: 'hackathon', description: 'Coding competitions' },
    { name: 'Networking', slug: 'networking', description: 'Professional networking events' },
    { name: 'Seminar', slug: 'seminar', description: 'Educational seminars' },
    { name: 'Social', slug: 'social', description: 'Social events' },
  ],
  ORGANIZATION: [
    { name: 'Technology', slug: 'org-technology', description: 'Tech companies & startups' },
    { name: 'Non-Profit', slug: 'non-profit', description: 'Non-profit organizations' },
    { name: 'Education', slug: 'org-education', description: 'Educational institutions' },
    { name: 'Government', slug: 'government', description: 'Government agencies' },
    { name: 'Corporate', slug: 'corporate', description: 'Corporate enterprises' },
    { name: 'Startup', slug: 'startup', description: 'Startup companies' },
  ],
} as const;
