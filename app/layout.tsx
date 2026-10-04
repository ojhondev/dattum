import type { Metadata } from "next";
import { Montagu_Slab, Public_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { THEME_COOKIE } from "@/lib/theme";
import Script from "next/script";
import { BotoesFlutuantes } from "@/components/marketing/BotoesFlutuantes";
import { lerConfiguracoes } from "@/lib/blog";
import { SITE_URL, SITE_NOME, SITE_DESCRICAO } from "@/lib/site";

const slab = Montagu_Slab({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--nf-slab",
});

const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--nf-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--nf-mono",
});

// Metadados globais. Verificação do Google/Bing e descrição padrão vêm do admin (/admin/seo).
export async function generateMetadata(): Promise<Metadata> {
  const cfg = await lerConfiguracoes();
  const descricao = cfg.site_descricao || SITE_DESCRICAO;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Dattis — o DPO da sua agência de tráfego pago",
      template: "%s · Dattis",
    },
    description: descricao,
    applicationName: SITE_NOME,
    alternates: { types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "Blog Dattis" }] } },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NOME,
      title: "Dattis — o DPO da sua agência de tráfego pago",
      description: descricao,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    verification: {
      google: cfg.google_verificacao || undefined,
      other: cfg.bing_verificacao ? { "msvalidate.01": cfg.bing_verificacao } : undefined,
    },
  };
}

// Google Tag Manager do site da Dattis (opcional). Só carrega tags conforme o consentimento do aviso de cookies.
const GTM_ID = /^GTM-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GTM_ID ?? "") ? process.env.NEXT_PUBLIC_GTM_ID : null;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={cn(slab.variable, sans.variable, mono.variable, "font-ui")} suppressHydrationWarning>
      <head>
        {/* Aplica o tema escolhido (cookie do ThemeToggle) antes da primeira pintura, em todas as páginas. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);if(m)document.documentElement.setAttribute("data-theme",m[1]);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <BotoesFlutuantes />
        {/* Aviso de cookies da Dattis antes de qualquer tag: liga o Modo de consentimento do Google com tudo negado. */}
        <Script src="/c/dattis.js" strategy="beforeInteractive" />
        {GTM_ID && (
          <Script id="gtm" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
      </body>
    </html>
  );
}
