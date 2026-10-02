import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],
  // Fontes e logo lidos em tempo de execução pelas imagens de compartilhamento (lib/og.tsx).
  outputFileTracingIncludes: {
    "/blog/**": ["./assets/fonts/**", "./public/brand/logo-fundo-dark.png"],
    "/opengraph-image": ["./assets/fonts/**", "./public/brand/logo-fundo-dark.png"],
    "/selo/**": ["./assets/fonts/**", "./public/brand/logo-fundo-dark.png", "./public/brand/logo-fundo-claro.png"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // A própria Dattis passa na vigilância que ela roda nos clientes.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
