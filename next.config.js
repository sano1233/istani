/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
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

  // Fast Refresh and Hot Reload optimization
  reactStrictMode: true,
  
  // SWC minification (faster than Terser)
  swcMinify: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Enable experimental features for faster builds
    experimental: {
      // Turbo mode for faster builds (Next.js 15)
      turbo: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
      },
      // Optimize package imports
      optimizePackageImports: [
        'lucide-react',
        '@supabase/supabase-js',
        'zustand',
      ],
    },
    
    // Faster refresh in development
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Optimize for fast refresh
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      return config;
    },
  }),

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Optimize production builds
    compress: true,
    poweredByHeader: false,
    // Enable standalone output for Docker
    output: 'standalone',
  }),

  // Suppress build warnings in production
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

module.exports = nextConfig
