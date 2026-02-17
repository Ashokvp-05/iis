import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance Optimizations */

  // Compress output for faster loading
  compress: true,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },

  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,


  // Development indicators
  devIndicators: {
    // @ts-expect-error - Next.js 15+ indicator config
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports (tree-shaking)
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
