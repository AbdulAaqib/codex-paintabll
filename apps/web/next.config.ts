import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: ['@ghost/shared'],
  devIndicators: false,
  env: {
    NEXT_PUBLIC_SERVER_URL:
      process.env.NEXT_PUBLIC_SERVER_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://ghost-arena.162.19.137.169.sslip.io'
        : 'http://localhost:3001'),
  },
};
export default config;
