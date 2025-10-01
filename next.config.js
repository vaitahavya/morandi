/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'morandilifestyle.com',
      },
      {
        protocol: 'https',
        hostname: 'www.morandilifestyle.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },
  env: {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
  },
  // Optimize for Vercel deployment
  output: 'standalone',
  // Reduce build time
  typescript: {
    // Warning: Don't use in production if you have type errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: Don't use in production if you have lint errors
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
