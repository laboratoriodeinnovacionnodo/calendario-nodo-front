/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // --- AÑADE ESTO ---
  async headers() {
    return [
      {
        // Esto aplica a todas las rutas de tu página
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // 'no-store' obliga al navegador y a Railway a pedir el archivo siempre
            // 'must-revalidate' asegura que no se use una versión vieja sin preguntar
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        // Para archivos estáticos (JS, CSS) que SÍ tienen hash en el nombre, 
        // dejamos que se cacheen porque Next.js les cambia el nombre en cada build.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;