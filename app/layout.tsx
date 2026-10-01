import type { Metadata } from "next";
import { Montagu_Slab, Public_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { THEME_COOKIE } from "@/lib/theme";
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
      default: "Dattis — Compliance LGPD para agências de tráfego pago",
      template: "%s · Dattis",
    },
    description: descricao,
    applicationName: SITE_NOME,
    alternates: { types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "Blog Dattis" }] } },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NOME,
      title: "Dattis — Compliance LGPD para agências de tráfego pago",
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
      </body>
    </html>
  );
}
