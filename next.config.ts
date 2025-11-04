import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "txgmkrihicuprkyjwxag.supabase.co" },
    ],
  },
};

export default nextConfig;
