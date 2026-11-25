import type { NextConfig } from 'next';

const upstreamUrl = (
  process.env.API_UPSTREAM_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.online-job.mikhy.me'
)
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')
  .replace(/^http:\/\/api\.online-job\.mikhy\.me/, 'https://api.online-job.mikhy.me');

const nextConfig: NextConfig = {
  devIndicators: false,
  /**
   * Route-level redirects live in `src/proxy.ts` instead of here: the proxy
   * runs before route matching, so a legacy URL such as `/auth/login` is
   * normalised even for anonymous visitors, before any auth redirect applies.
   */
  rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${upstreamUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
