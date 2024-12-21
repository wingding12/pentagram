import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pentagram.modal.run",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
