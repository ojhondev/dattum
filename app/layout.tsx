import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Dattum — Compliance LGPD para agências",
  description:
    "Diagnóstico de operador gratuito, sprint de higienização em 10 dias úteis, e as obrigações acessórias de LGPD rodando como assinatura fixa para agências de marketing digital e de lançamento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${hankenGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
