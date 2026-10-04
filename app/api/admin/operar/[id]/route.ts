import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { criarSessaoOperador, temServicoDpo } from "@/lib/auth";
import { registrar } from "@/lib/registro";
import { nomeDoDpo } from "@/lib/dpo";

export const runtime = "nodejs";

/**
 * O DPO da Dattis entra na conta de uma agência para prestar o serviço.
 * Só com login de admin, plano com DPO (Growth/Scale ou adicional) e acesso autorizado pela agência.
 * ?destino=/painel/... leva direto à tarefa.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Redireciona no mesmo endereço em que a pessoa está: o cookie da sessão só vale nele.
  const aqui = (caminho: string) => NextResponse.redirect(new URL(caminho, req.url));
  if (!(await isAdmin())) return aqui("/admin");
  const { id } = await params;
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, id) });
  if (!agencia || !agencia.acessoDattis || !temServicoDpo(agencia)) return aqui("/admin/dpo?erro=sem-acesso");

  const nome = await nomeDoDpo();
  await criarSessaoOperador(agencia.id, nome);
  await db.update(agencias).set({ dattisUltimoAcesso: new Date() }).where(eq(agencias.id, agencia.id));
  await registrar({ agenciaId: agencia.id, usuarioId: null, operador: nome }, "Entrou na conta para prestar o serviço de DPO");

  const destino = new URL(req.url).searchParams.get("destino") ?? "";
  return aqui(/^\/painel(\/|$|\?)/.test(destino) ? destino : "/painel");
}
