import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Dattis — Compliance LGPD para agências de tráfego pago",
  description:
    "Diagnóstico de risco gratuito, RAT e DPA automatizados por conta, e DPO as a Service — a camada de conformidade LGPD desenhada pro fluxo de dados de agências de performance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={cn(spaceGrotesk.variable, inter.variable, jetbrainsMono.variable, "font-sans")}>
      <body>{children}</body>
    </html>
  );
}
