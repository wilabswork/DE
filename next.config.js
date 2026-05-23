/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.shopee.sg' },
      { protocol: 'https', hostname: 'cf.shopee.sg' },
      { protocol: 'https', hostname: '**.lazada.sg' },
      { protocol: 'https', hostname: '**.amazon.sg' },
      { protocol: 'https', hostname: '**.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
    ],
  },
};
module.exports = nextConfig;
