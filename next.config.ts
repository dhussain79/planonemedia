import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
  },
  turbopack: {},
  images: {
    domains: ["pub-xxxx.r2.dev"],
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.vercel.app" },
    ],
  },
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
