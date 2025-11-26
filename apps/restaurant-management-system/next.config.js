/**
 * Next.js configuration for static export (SSG).
 * Configured for Tauri desktop app integration.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Tauri desktop app
  output: 'export',

  // Image optimization requires server, must be disabled for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.*.amazonaws.com',
      },
    ],
  },

  // Trailing slash for consistent static file serving
  trailingSlash: true,
};

export default nextConfig;
