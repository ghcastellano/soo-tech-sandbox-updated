/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://sootech.io https://framer.com https://*.framer.app;"
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://framer.com"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
