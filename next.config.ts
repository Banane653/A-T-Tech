import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.8', 'http://192.168.1.8:3000', '192.168.1.27', 'http://192.168.1.27:3000'],
};

export default nextConfig;
