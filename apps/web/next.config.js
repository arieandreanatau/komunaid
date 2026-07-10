/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@komunaid/shared", "@komunaid/ui"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/api/**": [
      "../../node_modules/.prisma/client/**",
      "../../node_modules/@prisma/client/**",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**",
      "../../node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client/**",
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
  async rewrites() {
    return [
      { source: "/health", destination: "/api/health" },
      { source: "/ready", destination: "/api/ready" },
      { source: "/live", destination: "/api/live" },
    ];
  },
};

module.exports = nextConfig;
