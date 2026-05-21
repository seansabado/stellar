import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["firebase-admin", "@stellar/stellar-sdk"],
  async rewrites() {
    return [
      {
        source: "/sw.js",
        destination: "/api/sw",
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
      {
        // SEP-0001 requires stellar.toml to be publicly accessible cross-origin
        source: "/.well-known/stellar.toml",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Content-Type",
            value: "text/plain",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
