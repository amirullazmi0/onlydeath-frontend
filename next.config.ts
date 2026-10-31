import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        // Product images live on ImageKit; Next fetches and serves them from our own
        // origin (/_next/image), so browsers that block third-party CDNs still see them.
        remotePatterns: [{ protocol: 'https', hostname: 'ik.imagekit.io', pathname: '/**' }],
    },
};

export default nextConfig;
