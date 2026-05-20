import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/sw.js",
        destination: "/api/sw",
      },
      {
        source: "/favicon.ico",
        destination: "/api/static/favicon",
      },
      {
        source: "/icon.svg",
        destination: "/api/static/icon",
      },
      {
        source: "/manifest.webmanifest",
        destination: "/api/static/manifest",
      },
    ];
  },
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;