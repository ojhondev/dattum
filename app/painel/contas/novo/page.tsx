import { getSessao } from "@/lib/auth";
import { ferramentasDaAgencia } from "@/lib/ferramentas-agencia";
import { Onboarding } from "@/components/app/Onboarding";

/** Cliente novo: o mesmo passo a passo do primeiro acesso, sem a parte da agência. */
export default async function NovaContaPage() {
  const sessao = await getSessao();
  if (!sessao) return null;
  return (
    <Onboarding
      modo="cliente"
      podeEditarAgencia={false}
      ferramentasProprias={await ferramentasDaAgencia(sessao.agenciaId)}
      agencia={{ nome: "", email: "", cnpj: "", responsavelNome: "", responsavelCargo: "", whatsapp: "", endereco: "" }}
    />
  );
}
