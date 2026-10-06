import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { atividadesTratamento, contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { bloqueioDemo } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";

// O nome da atividade é curto; os demais campos são frases (vão para o PDF do contrato e para a política pública).
const limite = (campo: string) => (campo === "nomeAtividade" ? 200 : 2000);

async function contaPertenceAgencia(contaId: string, agenciaId: string) {
  const conta = await db.query.contasCliente.findFirst({
    where: and(eq(contasCliente.id, contaId), eq(contasCliente.agenciaId, agenciaId)),
  });
  return !!conta;
}

export async function GET(_req: Request, { params }: { params: Promise<{ contaId: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { contaId } = await params;
  if (!(await contaPertenceAgencia(contaId, sessao.agenciaId))) {
    return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });
  }

  const atividades = await db.query.atividadesTratamento.findMany({
    where: eq(atividadesTratamento.contaClienteId, contaId),
    orderBy: (t, { asc }) => asc(t.createdAt),
  });

  return NextResponse.json({ ok: true, atividades });
}

export async function POST(req: Request, { params }: { params: Promise<{ contaId: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return demo;

  const { contaId } = await params;
  if (!(await contaPertenceAgencia(contaId, sessao.agenciaId))) {
    return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const campos = ["nomeAtividade", "categoriasDado", "finalidade", "baseLegal", "titulares", "prazoRetencao"] as const;
  const valores: Record<string, string> = {};
  for (const campo of campos) {
    const valor = body?.[campo];
    if (typeof valor !== "string" || !valor.trim()) {
      return NextResponse.json({ ok: false, error: `Campo obrigatório ausente: ${campo}.` }, { status: 400 });
    }
    valores[campo] = valor.trim().slice(0, limite(campo));
  }

  const [atividade] = await db
    .insert(atividadesTratamento)
    .values({
      agenciaId: sessao.agenciaId,
      contaClienteId: contaId,
      nomeAtividade: valores.nomeAtividade,
      categoriasDado: valores.categoriasDado,
      finalidade: valores.finalidade,
      baseLegal: valores.baseLegal,
      titulares: valores.titulares,
      prazoRetencao: valores.prazoRetencao,
      status: "rascunho",
    })
    .returning();

  return NextResponse.json({ ok: true, atividade });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ contaId: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return demo;

  const { contaId } = await params;
  if (!(await contaPertenceAgencia(contaId, sessao.agenciaId))) {
    return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const atividadeId = typeof body?.id === "string" ? body.id : "";
  if (!/^[0-9a-f-]{36}$/i.test(atividadeId)) {
    return NextResponse.json({ ok: false, error: "Informe o id da atividade." }, { status: 400 });
  }

  const campos = ["nomeAtividade", "categoriasDado", "finalidade", "baseLegal", "titulares", "prazoRetencao"] as const;
  const patch: Record<string, string> = {};
  for (const campo of campos) {
    if (typeof body?.[campo] === "string" && body[campo].trim()) {
      patch[campo] = body[campo].trim().slice(0, limite(campo));
    }
  }

  const [atualizada] = await db
    .update(atividadesTratamento)
    .set({ ...patch, updatedAt: new Date() })
    .where(
      and(eq(atividadesTratamento.id, atividadeId), eq(atividadesTratamento.contaClienteId, contaId))
    )
    .returning();

  if (!atualizada) {
    return NextResponse.json({ ok: false, error: "Atividade não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, atividade: atualizada });
}
