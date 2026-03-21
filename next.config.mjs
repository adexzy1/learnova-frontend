/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // In development, proxy /api/v1/* requests to the backend server.
    // In production a reverse proxy (Nginx, etc.) handles this instead.
    const backendUrl = process.env.API_BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/v1/:path*`,
      },
    ];
  },
}

export default nextConfig
