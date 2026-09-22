import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
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
