import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    EXPRESS_SERVER_URL: process.env.EXPRESS_SERVER_URL || 'http://localhost:3000',
  },
  experimental: {
    serverComponentsExternalPackages: ['multer'],
  },
};

export default nextConfig;
