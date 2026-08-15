import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'brawlify.com',
        pathname: '/brawlers/**',
      },
      {
        protocol: 'https',
        hostname: 'media.ffycdn.net',
      },
    ],
  },
};

export default nextConfig;
