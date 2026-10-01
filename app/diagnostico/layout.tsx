import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auditoria da sua agência: teste de LGPD em 19 perguntas",
  description:
    "Descubra em 3 minutos quanto sua agência de tráfego pago está exposta à LGPD: lista de clientes, API de Conversões, pixel, WhatsApp e contratos. Resultado na hora.",
  alternates: { canonical: "/diagnostico" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
