import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trust x-forwarded headers from proxy/tunnel
  serverExternalPackages: [],
};

export default nextConfig;
