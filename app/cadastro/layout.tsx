import type { Metadata } from "next";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false, follow: true } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
