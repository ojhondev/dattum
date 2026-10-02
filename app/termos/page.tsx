import type { Metadata } from "next";
import { PaginaLegal } from "@/components/legal/PaginaLegal";
import { dadosEmpresa } from "@/lib/empresa";
import { termosDeUso } from "@/lib/legal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Regras da assinatura da Dattis: o que a plataforma entrega, o que não entrega, pagamento, prazo e encerramento, certificado e responsabilidades.",
  alternates: { canonical: "/termos" },
};

export default async function Pagina() {
  return <PaginaLegal id="termos" markdown={termosDeUso(await dadosEmpresa())} />;
}
