import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSessao } from "@/lib/auth";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { Sidebar } from "@/components/app/Sidebar";
import SairButton from "./SairButton";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar");

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) redirect("/entrar");

  return (
    <div className="flex min-h-svh bg-canvas">
      <Sidebar agenciaNome={agencia.nome} sairSlot={<SairButton />} />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-10">{children}</main>
    </div>
  );
}
