/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplica esta regra a todas as páginas do seu app Vercel
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Permite 'self' (o próprio domínio) e QUALQUER subdomínio de 'framer.app' e 'framer.ai'.
            // Isso cobre o editor do Framer e seu site publicado.
            value: "frame-ancestors 'self' https://*.framer.app https://*.framer.ai;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
