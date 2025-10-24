/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplica esta regra para todas as rotas do seu app Vercel
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            
            // Esta é a parte importante:
            // 'self': Permite que o Vercel embede a si mesmo.
            // 'https://*.framer.app': Permite que QUALQUER site do Framer (incluindo seu editor e seu site publicado) embede seu app.
            // 'https://*.framer.ai': Adicionado por segurança, caso o Framer use este domínio.
            // 'https://sootech.com.br': SEU DOMÍNIO customizado final (adicione o seu)
            // 'https://www.sootech.com.br': A variação 'www' do seu domínio
            
            value:
              "frame-ancestors 'self' https://*.framer.app https://*.framer.ai https://sootech.com.br https://www.sootech.io;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
