import type { Metadata } from "next";
import { Montagu_Slab, Public_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { THEME_COOKIE } from "@/lib/theme";
import { BotoesFlutuantes } from "@/components/marketing/BotoesFlutuantes";

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

export const metadata: Metadata = {
  title: {
    default: "Dattis — Compliance LGPD para agências de tráfego pago",
    template: "%s · Dattis",
  },
  description:
    "A Dattis gera, para cada cliente que sua agência atende, o RAT, o DPA e o registro de subprocessadores — sem precisar contratar um advogado por documento.",
};

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
