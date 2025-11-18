/** @type {import('next').NextConfig} */
const nextConfig = require('./next.config.js');

// Turbo-specific optimizations
module.exports = {
  ...nextConfig,
  experimental: {
    ...nextConfig.experimental,
    turbo: {
      ...nextConfig.experimental?.turbo,
      // Additional turbo optimizations
      resolveAlias: {
        '@': './',
      },
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
};

