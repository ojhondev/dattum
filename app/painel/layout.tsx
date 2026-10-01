import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { PLANOS } from "@/lib/planos";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import SairButton from "./SairButton";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar");

  const [agencia, [{ n }]] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) }),
    db.select({ n: count() }).from(contasCliente).where(eq(contasCliente.agenciaId, sessao.agenciaId)),
  ]);
  if (!agencia) redirect("/entrar");
  const plano = PLANOS.find((p) => p.id === agencia.plano);

  return (
    <div className="flex min-h-svh bg-canvas">
      <Sidebar
        agenciaNome={agencia.nome}
        sairSlot={<SairButton />}
        plano={plano ? { nome: plano.nome, usados: Number(n), limite: agencia.clientesContratados } : undefined}
      />
      <div className="min-w-0 flex-1">
        <Topbar agenciaNome={agencia.nome} />
        <main className="px-4 pb-16 pt-6 sm:px-10 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
