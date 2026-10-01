import type { Metadata } from "next";
import { PaginaLegal } from "@/components/legal/PaginaLegal";
import { dadosEmpresa } from "@/lib/empresa";
import { contratoDeDados } from "@/lib/legal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contrato de Tratamento de Dados (DPA)",
  description: "Contrato de operador entre a Dattis e a agência: dados tratados, suboperadores, segurança, incidentes e fim do tratamento.",
  alternates: { canonical: "/contrato-de-dados" },
};

export default async function Pagina() {
  return <PaginaLegal id="contrato-de-dados" markdown={contratoDeDados(await dadosEmpresa())} />;
}
