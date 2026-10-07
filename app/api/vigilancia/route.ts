import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { varreduraResultados } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { bloqueioExploracao } from "@/lib/demo-bloqueio";
import { contaDaAgencia } from "@/lib/contas";
import { executarVarredura } from "@/lib/vigilancia";

export const runtime = "nodejs";
export const maxDuration = 60;

const INTERVALO_MIN = 5;

// A agência pede uma verificação na hora de UMA conta (ex.: depois de corrigir o site).
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const exploracao = await bloqueioExploracao(sessao.agenciaId);
  if (exploracao) return exploracao;

  const body = await req.json().catch(() => null);
  const contaId = typeof body?.contaId === "string" ? body.contaId : "";
  const conta = contaId ? await contaDaAgencia(contaId, sessao.agenciaId) : null;
  if (!conta) return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });

  const ultimo = await db.query.varreduraResultados.findFirst({
    where: and(eq(varreduraResultados.contaClienteId, conta.id), eq(varreduraResultados.agenciaId, sessao.agenciaId)),
    orderBy: desc(varreduraResultados.verificadoEm),
  });
  if (ultimo && Date.now() - ultimo.verificadoEm.getTime() < INTERVALO_MIN * 60_000) {
    return NextResponse.json({ ok: false, error: `Essa conta foi verificada há pouco. Tente de novo em ${INTERVALO_MIN} minutos.` }, { status: 429 });
  }

  await executarVarredura({ origem: "agencia", contaId: conta.id });
  return NextResponse.json({ ok: true });
}
