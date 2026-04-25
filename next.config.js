/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['cms.explosion.fun'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.explosion.fun',
        port: '',
        pathname: '/**',
      },
    ],
  },
  trailingSlash: true,
}

module.exports = nextConfig
