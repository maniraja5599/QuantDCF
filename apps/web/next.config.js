/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  },
  async rewrites() {
    // If an external backend is explicitly configured via environment variable, proxy /api requests to it.
    // Otherwise on Vercel or standalone cloud, Next.js handles all /api routes natively via Serverless Functions.
    if (process.env.BACKEND_API_URL) {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.BACKEND_API_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
