import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, dpas } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { filtroVigente, novoToken } from "@/lib/dpa";
import { urlAbsoluta } from "@/lib/site";
import { registrar } from "@/lib/registro";
import { planoPermite } from "@/lib/planos";
import { bloqueioDemo } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";

const buscar = (id: string, agenciaId: string) =>
  db.query.dpas.findFirst({ where: and(eq(dpas.id, id), eq(dpas.agenciaId, agenciaId), filtroVigente) });

/** Gera (ou devolve) o link público para o cliente assinar o contrato. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return demo;
  const { id } = await params;

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { plano: true } });
  if (!planoPermite(agencia?.plano, "assinaturaEletronicaCliente")) {
    return NextResponse.json({ ok: false, error: "A assinatura eletrônica pelo cliente faz parte dos planos Growth e Scale. No Start, o cliente assina o PDF e você registra a assinatura." }, { status: 403 });
  }

  const dpa = await buscar(id, sessao.agenciaId);
  if (!dpa) return NextResponse.json({ ok: false, error: "Contrato não encontrado." }, { status: 404 });
  if (dpa.clienteAssinadoEm) return NextResponse.json({ ok: false, error: "O cliente já assinou este contrato." }, { status: 409 });

  let token = dpa.tokenAssinatura;
  if (!token) {
    token = novoToken();
    await db.update(dpas).set({ tokenAssinatura: token }).where(eq(dpas.id, dpa.id));
    await registrar(sessao, "Gerou o link de assinatura do contrato", `Versão ${dpa.versao}`);
  }
  return NextResponse.json({ ok: true, url: urlAbsoluta(`/assinar/${token}`) });
}

/** Invalida o link (ex.: foi enviado para a pessoa errada). Um novo pode ser gerado depois. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return demo;
  const { id } = await params;

  const dpa = await buscar(id, sessao.agenciaId);
  if (!dpa) return NextResponse.json({ ok: false, error: "Contrato não encontrado." }, { status: 404 });
  await db.update(dpas).set({ tokenAssinatura: null }).where(eq(dpas.id, dpa.id));
  return NextResponse.json({ ok: true });
}
