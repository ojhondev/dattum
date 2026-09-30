import type { Metadata } from "next";

export const metadata: Metadata = { title: "Área Dattis", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-canvas">{children}</div>;
}
