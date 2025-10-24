/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            
            // CORREÇÃO: Adicionando 'https://framer.com' para permitir o editor do Framer.
            // Também mantemos 'https://*.framer.app' para o seu site publicado 
            // e adicionamos 'https://*.framer.website' como garantia.
            
            value:
              "frame-ancestors 'self' https://framer.com https://*.framer.app https://*.framer.website;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
