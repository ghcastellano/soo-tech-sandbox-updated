/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplica esta regra a todas as rotas
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            
            // ISTO PERMITE:
            // 'self': O próprio app Vercel
            // 'https://framer.com': O editor do Framer
            // 'https://*.framer.app': Seu site publicado no Framer (como o sincere-english-...)
            // 'https://*.framer.website': Outro domínio de publicação do Framer
            
            value:
              "frame-ancestors 'self' https://framer.com https://*.framer.app https://*.framer.website;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
