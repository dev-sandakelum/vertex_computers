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
};

export default nextConfig;
