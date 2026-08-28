const path = require("path");
const fs = require("fs");

function loadEnv() {
  if (process.env.VERCEL) return;
  const envFile = process.env.NODE_ENV === "production"
    ? "../../.env.production"
    : "../../.env.development";
  const envPath = path.resolve(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
  }
}
loadEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@komunaid/shared", "@komunaid/ui", "@komunaid/database", "@komunaid/utils"],
  serverExternalPackages: ["ioredis"],
  outputFileTracingIncludes: {
    "/api/**": [
      "../../node_modules/.prisma/client/**",
      "../../node_modules/@prisma/client/**",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/**",
      "../api/src/**",
      "../api/package.json",
      "../packages/database/src/**",
      "../packages/database/package.json",
      "../packages/utils/src/**",
      "../packages/utils/package.json",
      "../packages/shared/src/**",
      "../packages/shared/package.json",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "localhost" },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/health", destination: "/api/health" },
      { source: "/ready", destination: "/api/ready" },
      { source: "/live", destination: "/api/live" },
    ];
  },
  async redirects() {
    // The legacy community-management tree under /communities/[slug]/* has been
    // retired in favor of the canonical /dashboard/communities/[slug]/* workspace
    // (see apps/web/components/community-dashboard-route.tsx). These entries keep
    // existing links/bookmarks working. Kept in next.config.js (rather than
    // middleware or per-page redirect() calls) because the mapping is a static,
    // slug-preserving path rewrite with no auth/role logic involved.
    return [
      { source: "/communities/:slug/edit", destination: "/dashboard/communities/:slug/settings", permanent: false },
      { source: "/communities/:slug/settings", destination: "/dashboard/communities/:slug/settings", permanent: false },
      { source: "/communities/:slug/join-requests", destination: "/dashboard/communities/:slug/requests", permanent: false },
    ];
  },
};

module.exports = nextConfig;
