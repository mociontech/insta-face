/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["storage.googleapis.com", "cdn.morfran.com"],
  },
};

export default nextConfig;
