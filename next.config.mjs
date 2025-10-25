/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Headers obrigatórios para embed do Framer + domínio SooTech
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://sootech.io https://www.sootech.io https://framer.com https://*.framer.app;"
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
    ];
  }
};

export default nextConfig;
