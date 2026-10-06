import type { NextConfig } from "next";

// Política de conteúdo: scripts só do próprio site e do Google Tag Manager (e das tags de marketing que ele
// costuma disparar: GA4, Google Ads, Meta, Clarity, LinkedIn, TikTok). Ao incluir uma tag nova no GTM que
// carregue de outro domínio, adicione o domínio aqui. unsafe-inline é exigido pelos scripts do Next e do GTM;
// unsafe-eval pelas variáveis de JavaScript personalizado do GTM.
const MARKETING = [
  "https://*.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.google.com",
  "https://*.googleadservices.com",
  "https://*.doubleclick.net",
  "https://*.facebook.net",
  "https://*.facebook.com",
  "https://*.clarity.ms",
  "https://*.licdn.com",
  "https://*.linkedin.com",
  "https://*.tiktok.com",
].join(" ");

// O banner de cookies envia o aceite para o endereço oficial, mesmo quando o site é aberto por outro endereço.
const SITE = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.dattis.com.br").origin;

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${MARKETING}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  `connect-src 'self' ${SITE} ${MARKETING}`,
  `frame-src 'self' ${MARKETING}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []), // local roda em http
].join("; ");

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
          { key: "Content-Security-Policy", value: CSP },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
