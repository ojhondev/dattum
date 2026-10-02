import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { getSessao, hashSenha, verificarSenha } from "@/lib/auth";
import { EMAIL_DEMO } from "@/lib/admin-dados";

export const runtime = "nodejs";

/** Troca a senha (pede a atual) ou cria a primeira senha de quem entrou só com o Google. */
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });
  if (agencia.email === EMAIL_DEMO) {
    return NextResponse.json({ ok: false, error: "A conta de demonstração é compartilhada e não pode ser alterada." }, { status: 403 });
  }

  const b = await req.json().catch(() => null);
  const nova = typeof b?.nova === "string" ? b.nova : "";
  if (nova.length < 8) return NextResponse.json({ ok: false, error: "A nova senha precisa ter pelo menos 8 caracteres." }, { status: 400 });

  if (agencia.senhaDefinida) {
    const atual = typeof b?.atual === "string" ? b.atual : "";
    if (!(await verificarSenha(atual, agencia.senhaHash))) {
      return NextResponse.json({ ok: false, error: "A senha atual não confere." }, { status: 403 });
    }
  }

  await db.update(agencias).set({ senhaHash: await hashSenha(nova), senhaDefinida: true }).where(eq(agencias.id, agencia.id));
  return NextResponse.json({ ok: true });
}
