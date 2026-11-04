import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  /**
   * Route-level redirects live in `src/proxy.ts` instead of here: the proxy
   * runs before route matching, so a legacy URL such as `/auth/login` is
   * normalised even for anonymous visitors, before any auth redirect applies.
   */
};

export default nextConfig;
