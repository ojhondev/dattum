import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { contaDaAgencia } from "@/lib/contas";
import { novoToken } from "@/lib/dpa";
import { urlAbsoluta } from "@/lib/site";
import { bloqueioDemo } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";

async function conta(id: string) {
  const sessao = await getSessao();
  if (!sessao) return { erro: NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 }) };
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return { erro: demo };
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId) });
  if (agencia?.plano === "start") return { erro: NextResponse.json({ ok: false, error: "O DAT faz parte dos planos Growth e Scale." }, { status: 403 }) };
  const c = await contaDaAgencia(id, sessao.agenciaId);
  if (!c) return { erro: NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 }) };
  return { c };
}

/** Link público do DAT: o cliente abre e vê sempre a situação do dia. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await conta((await params).id);
  if (r.erro) return r.erro;
  let token = r.c.tokenPublico;
  if (!token) {
    token = novoToken();
    await db.update(contasCliente).set({ tokenPublico: token }).where(eq(contasCliente.id, r.c.id));
  }
  return NextResponse.json({ ok: true, url: urlAbsoluta(`/dat/${token}`) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await conta((await params).id);
  if (r.erro) return r.erro;
  await db.update(contasCliente).set({ tokenPublico: null }).where(eq(contasCliente.id, r.c.id));
  return NextResponse.json({ ok: true });
}
