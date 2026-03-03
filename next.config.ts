import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "pjtzqctwfvainvirtaern.supabase.co" },
      { hostname: "upload.wikimedia.org" },
      { hostname: "download.logo.wine" },
      { hostname: "play-lh.googleusercontent.com" },
      { hostname: "www.dutchbanglabank.com" },
    ],
  },
};

export default nextConfig;
