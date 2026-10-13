/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support deployment when backend API is hosted separately
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
  },
  async rewrites() {
    // In local development, proxy /api requests to FastAPI backend if desired
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
