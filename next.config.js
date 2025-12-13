/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Ensure API routes are not statically generated
  output: 'standalone',
}

module.exports = nextConfig

