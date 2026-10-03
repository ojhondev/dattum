import { eq } from "drizzle-orm";
import { ehDono, getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { Onboarding } from "@/components/app/Onboarding";

/** Preenchimento guiado do primeiro acesso: agência + primeiro cliente, numa conversa só. */
export default async function ComecarPage() {
  const sessao = await getSessao();
  if (!sessao) return null;
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return null;
  return (
    <Onboarding
      modo="agencia"
      podeEditarAgencia={ehDono(sessao) && agencia.email !== EMAIL_DEMO}
      agencia={{
        nome: agencia.nome,
        email: agencia.email,
        cnpj: agencia.cnpj ?? "",
        responsavelNome: agencia.responsavelNome ?? "",
        responsavelCargo: agencia.responsavelCargo ?? "",
        whatsapp: agencia.whatsapp ?? "",
        endereco: agencia.endereco ?? "",
      }}
    />
  );
}
