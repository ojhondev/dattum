import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contasCliente, dpas } from "@/lib/db/schema";
import { ehOperador, getSessao } from "@/lib/auth";
import { automatizarCertificados } from "@/lib/automacao";
import { ASSINATURA_FORA, filtroVigente, registrarAssinatura, situacaoDpa } from "@/lib/dpa";
import { registrar } from "@/lib/registro";
import { bloqueioDemo, bloqueioExploracao } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Plano Start: o cliente assina o PDF fora da Dattis (à mão ou no assinador que a agência já usa)
 * e a agência registra aqui quem assinou e em que dia. A via assinada fica com a agência.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return demo;
  const exploracao = await bloqueioExploracao(sessao.agenciaId);
  if (exploracao) return exploracao;
  // Quem declara a assinatura do cliente responde por ela: é ato da agência, não do DPO da Dattis.
  if (ehOperador(sessao)) {
    return NextResponse.json({ ok: false, error: "Quem registra a assinatura do cliente é a agência, que guarda a via assinada." }, { status: 403 });
  }

  const { id } = await params;
  const b = await req.json().catch(() => null);
  const nome = typeof b?.nome === "string" ? b.nome.trim().slice(0, 120) : "";
  const cargo = typeof b?.cargo === "string" ? b.cargo.trim().slice(0, 120) : "";
  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase().slice(0, 160) : "";
  const data = typeof b?.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.data) ? new Date(`${b.data}T12:00:00-03:00`) : null;
  if (!nome || !cargo || !data || Number.isNaN(data.getTime()) || b?.aceite !== true) {
    return NextResponse.json({ ok: false, error: "Informe quem assinou, o cargo, a data e confirme que guarda a via assinada." }, { status: 400 });
  }
  if (email && !EMAIL.test(email)) return NextResponse.json({ ok: false, error: "Esse e-mail não parece válido." }, { status: 400 });
  if (data.getTime() > Date.now() + 86_400_000) return NextResponse.json({ ok: false, error: "A data da assinatura não pode ser no futuro." }, { status: 400 });

  const atual = await db.query.dpas.findFirst({ where: and(eq(dpas.id, id), eq(dpas.agenciaId, sessao.agenciaId), filtroVigente) });
  if (!atual) return NextResponse.json({ ok: false, error: "Contrato não encontrado." }, { status: 404 });
  if (atual.clienteAssinadoEm) return NextResponse.json({ ok: false, error: "A assinatura do cliente já está registrada." }, { status: 409 });
  if (data.getTime() < atual.createdAt.getTime() - 86_400_000) {
    return NextResponse.json({ ok: false, error: "A data é anterior a esta versão do contrato. Confira se o cliente assinou a versão atual." }, { status: 400 });
  }

  const dpa = await registrarAssinatura(atual, "cliente", { nome, cargo, email: email || null, ip: null, userAgent: ASSINATURA_FORA, em: data });
  if (!dpa) return NextResponse.json({ ok: false, error: "A assinatura do cliente já está registrada." }, { status: 409 });

  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, dpa.contaClienteId), columns: { nome: true } });
  await registrar(sessao, "Registrou a assinatura do cliente feita fora da Dattis", `${conta?.nome ?? "Cliente"} · ${nome} (${cargo}) · versão ${dpa.versao}`);
  if (situacaoDpa(dpa) === "assinado") await automatizarCertificados(sessao.agenciaId).catch(() => null);
  return NextResponse.json({ ok: true, situacao: situacaoDpa(dpa) });
}
