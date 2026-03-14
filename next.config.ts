import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
    ],
  },
  basePath: "", // raíz de la app
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
