/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  transpilePackages: ["@stampgame/ui", "@stampgame/config", "@stampgame/db"],
};

export default nextConfig;
