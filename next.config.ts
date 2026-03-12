/** @type {import('next').NextConfig} */
const nextConfig = {

  /* S3 static export */
  output: "export",

  /* Required for static hosting */
  trailingSlash: false,

  /* Next image optimizer does not work on S3 */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kzarre-products.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kzarre-products.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },

};

export default nextConfig;