/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // the whole photo set is local and already sized for the layout
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
