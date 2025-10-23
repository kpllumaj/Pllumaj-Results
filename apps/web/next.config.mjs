/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  transpilePackages: ['@pllumaj/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
