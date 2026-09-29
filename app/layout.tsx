import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-src",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-src",
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
    <html lang="pt-BR" className={cn(spaceGrotesk.variable, inter.variable, jetbrainsMono.variable, "font-ui")}>
      <body>{children}</body>
    </html>
  );
}
