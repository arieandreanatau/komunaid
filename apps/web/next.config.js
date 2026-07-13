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
    ignoreBuildErrors: true,
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
};

module.exports = nextConfig;
