/** Static export for GitHub Pages, served from https://kirtanbhatt10.github.io/portfolio/ */
const basePath = '/portfolio';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
