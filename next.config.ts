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
              "frame-ancestors https://framer.com https://*.framer.app 'self';",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://framer.com",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://framer.com https://*.framer.app *",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
