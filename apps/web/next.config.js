const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: "/audit/:id",
        destination: "/app/audit/:id",
        permanent: false,
      },
      {
        source: "/report/:id",
        destination: "/app/report/:id",
        permanent: false,
      },
      {
        source: "/app",
        destination: "/app/research",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/app/research",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "/app/research",
        permanent: false,
      },
      {
        source: "/signin",
        destination: "/app/research",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
