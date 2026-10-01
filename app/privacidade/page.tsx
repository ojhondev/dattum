import type { Metadata } from "next";
import { PaginaLegal } from "@/components/legal/PaginaLegal";
import { dadosEmpresa } from "@/lib/empresa";
import { politicaDePrivacidade } from "@/lib/legal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Dattis trata dados pessoais: o que coleta, para quê, base legal, cookies, fornecedores, prazos de guarda e como exercer seus direitos.",
  alternates: { canonical: "/privacidade" },
};

export default async function Pagina() {
  return <PaginaLegal id="privacidade" markdown={politicaDePrivacidade(await dadosEmpresa())} />;
}
