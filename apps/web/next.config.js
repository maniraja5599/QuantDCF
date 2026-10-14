/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support deployment when backend API is hosted separately
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
  },
  async rewrites() {
    // Proxy /api requests to FastAPI backend so mobile devices and desktop share the same origin
    const apiBase = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
