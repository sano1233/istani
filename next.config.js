/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  // Skip static generation for auth pages that require runtime environment variables
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
