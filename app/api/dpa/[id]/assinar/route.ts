import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { dpas } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { automatizarCertificados } from "@/lib/automacao";
import { filtroVigente, ipDe, registrarAssinatura, userAgentDe, situacaoDpa } from "@/lib/dpa";
import { registrar } from "@/lib/registro";
import { contasCliente } from "@/lib/db/schema";

export const runtime = "nodejs";

// Assinatura da AGÊNCIA (operadora). O cliente assina pelo link público /assinar/[token].
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim().slice(0, 120) : "";
  const cargo = typeof body?.cargo === "string" ? body.cargo.trim().slice(0, 120) : "";
  if (!nome || !cargo || body?.aceite !== true) {
    return NextResponse.json({ ok: false, error: "Informe nome, cargo e confirme que leu e concorda com o contrato." }, { status: 400 });
  }

  const atual = await db.query.dpas.findFirst({ where: and(eq(dpas.id, id), eq(dpas.agenciaId, sessao.agenciaId), filtroVigente) });
  if (!atual) return NextResponse.json({ ok: false, error: "Contrato não encontrado ou substituído por uma versão mais nova." }, { status: 404 });
  if (atual.assinadoEm) return NextResponse.json({ ok: false, error: "A agência já assinou este contrato." }, { status: 409 });

  const dpa = await registrarAssinatura(atual, "agencia", { nome, cargo, ip: ipDe(req), userAgent: userAgentDe(req) });
  if (!dpa) return NextResponse.json({ ok: false, error: "A agência já assinou este contrato." }, { status: 409 });

  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, dpa.contaClienteId), columns: { nome: true } });
  await registrar(sessao, "Assinou o contrato de dados pela agência", `${conta?.nome ?? ""} · versão ${dpa.versao} · como ${nome}`);
  // Contrato completo costuma destravar o certificado: emite na hora, sem a agência pedir.
  const auto = situacaoDpa(dpa) === "assinado" ? await automatizarCertificados(sessao.agenciaId).catch(() => ({ emitidos: 0 })) : { emitidos: 0 };
  return NextResponse.json({ ok: true, dpa, certificadosEmitidos: auto.emitidos });
}
