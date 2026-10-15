/** @type {import('next').NextConfig} */

// Los artes se publican con nombre fijo: si cambias uno, sube este número (y CACHE en public/sw.js) para que todos lo vuelvan a bajar.
const ASSET_VERSION = "1";
const LONG_CACHE = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];

const nextConfig = {
  reactStrictMode: false,
  env: { NEXT_PUBLIC_ASSET_VERSION: ASSET_VERSION },
  images: {
    domains: ["storage.googleapis.com"],
  },
  async headers() {
    return [
      // Artes, fuentes e íconos: el navegador los guarda un año y no los vuelve a pedir al reiniciar la experiencia.
      { source: "/ENRUTA/:path*", headers: LONG_CACHE },
      { source: "/oracle/:path*", headers: LONG_CACHE },
      { source: "/:file(.+\\.(?:webp|png|jpg|jpeg|gif|svg|woff2?))", headers: LONG_CACHE },
      // El service worker nunca se cachea (así una versión nueva se instala sola).
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
  },
};

export default nextConfig;
