import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { ehDono, ehOperador, getSessao } from "@/lib/auth";
import { bloqueioDemo } from "@/lib/demo-bloqueio";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

/** Desconecta o login com Google da agência. Só com senha criada, para a conta não ficar sem forma de entrar. */
export async function DELETE() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return demo;
  if (!ehDono(sessao) || ehOperador(sessao)) {
    return NextResponse.json({ ok: false, error: "Só o dono da conta conecta ou desconecta o login com Google." }, { status: 403 });
  }

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { googleSub: true, senhaDefinida: true } });
  if (!agencia?.googleSub) return NextResponse.json({ ok: true });
  if (!agencia.senhaDefinida) {
    return NextResponse.json({ ok: false, error: "Crie uma senha antes de desconectar o Google, senão a conta fica sem forma de entrar." }, { status: 400 });
  }

  await db.update(agencias).set({ googleSub: null }).where(eq(agencias.id, sessao.agenciaId));
  await registrar(sessao, "Desconectou o login com Google");
  return NextResponse.json({ ok: true });
}
