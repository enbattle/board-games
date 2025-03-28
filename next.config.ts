/** @type {import('next').NextConfig} */
const nextConfig = {
  // This will only apply the basePath in production, not during development
  basePath: process.env.NODE_ENV === "production" ? "/board-games" : "",

  // For GitHub Pages static export
  output: process.env.NODE_ENV === "production" ? "export" : undefined,

  // Recommended for static sites
  trailingSlash: true,

  // Required for static image export
  images: {
    unoptimized: true,
  },

  // Add any other Next.js configurations you need
};

module.exports = nextConfig;
