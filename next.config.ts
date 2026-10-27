import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained build artefact for Docker.
  // The standalone folder + public + .next/static is everything the server needs.
  // Skip on Vercel — its platform expects the default build output, not standalone.
  output: process.env.VERCEL ? undefined : "standalone",
  experimental: {
    // Match the Vercel build machine (2 cores). Prevents Next.js from spawning
    // more workers than CPUs, which wastes memory and slows the build.
    cpus: 2,
  },
  images: {
    // Serve AVIF first (25-50% smaller than WebP at similar quality), WebP as
    // the fallback for older Safari. Browsers pick via Accept negotiation.
    formats: ["image/avif", "image/webp"],
    // Product photos are served from the GitHub raw CDN (see PRODUCT_IMAGE_CDN
    // in lib/data.ts — local /product-images/... paths are rewritten there).
    // Scoped to this repo's path so a future redirect can't proxy arbitrary hosts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/dev-sandakelum/product-images-for-vertex-computers/**",
      },
    ],
    // Optimized images are revalidated at most after 30 days. Source files are
    // path-versioned (immutable), so a long TTL is safe; it also overrides the
    // short 5-minute Cache-Control GitHub raw sends.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
