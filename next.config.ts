import type { NextConfig } from "next";

// Cabeceras de seguridad para todas las respuestas: el sitio no se puede embeber en
// iframes ajenos (clickjacking), el navegador no adivina tipos de archivo y el
// Referer no sale completo hacia otros sitios.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  images: {
    // Solo se optimizan imágenes de Vercel Blob; las de otros hosts se muestran sin
    // optimizar (ver isOptimizableImage en src/lib/utils.ts), así el optimizador no
    // sirve de proxy hacia cualquier sitio.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    serverActions: {
      // Server Actions rechaza payloads >1MB por defecto; las fotos de perfil/producto
      // permiten hasta 5MB en src/lib/upload.ts, así que el límite del framework debe igualarlo.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
