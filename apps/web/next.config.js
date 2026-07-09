/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@komunaid/shared", "@komunaid/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "localhost" },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/health", destination: "/api/health" },
      { source: "/ready", destination: "/api/ready" },
      { source: "/live", destination: "/api/live" },
    ];
  },
};

module.exports = nextConfig;
