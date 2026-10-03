import { Onboarding } from "@/components/app/Onboarding";

/** Cliente novo: o mesmo passo a passo do primeiro acesso, sem a parte da agência. */
export default function NovaContaPage() {
  return (
    <Onboarding
      modo="cliente"
      podeEditarAgencia={false}
      agencia={{ nome: "", email: "", cnpj: "", responsavelNome: "", responsavelCargo: "", whatsapp: "", endereco: "" }}
    />
  );
}
