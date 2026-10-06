import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { ferramentasDaAgencia } from "@/lib/ferramentas-agencia";
import { Onboarding } from "@/components/app/Onboarding";
import { planoPermite } from "@/lib/planos";

/** Cliente novo: o mesmo passo a passo do primeiro acesso, sem a parte da agência. */
export default async function NovaContaPage() {
  const sessao = await getSessao();
  if (!sessao) return null;
  const [agencia, proprias] = await Promise.all([db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }), ferramentasDaAgencia(sessao.agenciaId)]);
  return (
    <Onboarding
      modo="cliente"
      podeEditarAgencia={false}
      recursos={{ assinaturaEletronica: planoPermite(agencia?.plano, "assinaturaEletronicaCliente"), relatorio: planoPermite(agencia?.plano, "relatorio") }}
      ferramentasProprias={proprias}
      agencia={{
        nome: agencia?.nome ?? "",
        email: agencia?.email ?? "",
        cnpj: agencia?.cnpj ?? "",
        responsavelNome: agencia?.responsavelNome ?? "",
        responsavelCargo: agencia?.responsavelCargo ?? "",
        whatsapp: agencia?.whatsapp ?? "",
        endereco: agencia?.endereco ?? "",
      }}
    />
  );
}
