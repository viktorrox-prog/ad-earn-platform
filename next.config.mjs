/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "/home/app/.next",
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;


