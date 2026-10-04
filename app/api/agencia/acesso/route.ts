import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { ehDono, ehOperador, getSessao } from "@/lib/auth";
import { registrar } from "@/lib/registro";
import { EMAIL_DEMO } from "@/lib/admin-dados";

export const runtime = "nodejs";

/** A agência liga ou desliga o acesso do DPO da Dattis à conta. Só o dono decide. */
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  if (!ehDono(sessao) || ehOperador(sessao)) return NextResponse.json({ ok: false, error: "Só o dono da conta decide o acesso da Dattis." }, { status: 403 });
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });
  if (agencia.email === EMAIL_DEMO) return NextResponse.json({ ok: false, error: "A conta de demonstração é compartilhada e não pode ser alterada." }, { status: 403 });

  const b = await req.json().catch(() => null);
  const ativo = b?.ativo === true;
  await db.update(agencias).set({ acessoDattis: ativo, acessoDattisEm: ativo ? new Date() : agencia.acessoDattisEm }).where(eq(agencias.id, agencia.id));
  await registrar(sessao, ativo ? "Autorizou o DPO da Dattis a operar a conta" : "Retirou o acesso do DPO da Dattis à conta");
  return NextResponse.json({ ok: true });
}
