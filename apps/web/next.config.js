const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/app", destination: "/audits", permanent: false },
      { source: "/app/audit", destination: "/audits", permanent: false },
      { source: "/app/audit/:id", destination: "/audits/:id", permanent: false },
      { source: "/app/report/:id", destination: "/audits/:id/report", permanent: false },
      { source: "/app/research", destination: "/research", permanent: false },
      { source: "/app/research/:id", destination: "/research/:id", permanent: false },
      { source: "/app/research/:id/report", destination: "/research/:id/report", permanent: false },
      { source: "/audit/:id", destination: "/audits/:id", permanent: false },
      { source: "/report/:id", destination: "/audits/:id/report", permanent: false },
      { source: "/api/audit", destination: "/api/audits", permanent: false },
    ];
  },
};

module.exports = nextConfig;
