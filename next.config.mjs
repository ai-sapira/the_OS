/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Experimental features for better cookie handling
  experimental: {
    // Ensure cookies are properly handled in middleware
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig