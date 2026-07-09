/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@komunaid/shared", "@komunaid/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
