import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auditoria de site: pixel, cookies e política de privacidade",
  description:
    "Cole o endereço do site do seu cliente e veja se o Pixel do Meta e a tag do Google disparam antes do consentimento, se há banner de cookies e política de privacidade.",
  alternates: { canonical: "/auditoria" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
