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
    ],
  },
  env: {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
  },
};

module.exports = nextConfig;
