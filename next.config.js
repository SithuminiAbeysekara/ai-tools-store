/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: Move turbopack root to the correct top-level key (Next.js 15+)
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
