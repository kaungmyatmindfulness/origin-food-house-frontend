/**
 * Next.js configuration for static export (SSG).
 * Configured for Tauri desktop app integration.
 */

const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

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

  // Critical for Tauri dev mode - resolve assets correctly
  // In production, assets are served from the same origin
  // In development, we need to point to the Next.js dev server
  assetPrefix: isProd ? undefined : `http://${internalHost}:3002`,
};

export default nextConfig;
