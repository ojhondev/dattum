import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { dpas, contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { htmlDoDpa, htmlParaPdf, nomeArquivo } from "@/lib/dpa-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const dpa = await db.query.dpas.findFirst({
    where: and(eq(dpas.id, id), eq(dpas.agenciaId, sessao.agenciaId)),
  });
  if (!dpa) return NextResponse.json({ ok: false, error: "Contrato não encontrado." }, { status: 404 });

  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, dpa.contaClienteId) });
  try {
    const pdf = await htmlParaPdf(htmlDoDpa(dpa, conta?.nome ?? ""));
    return new NextResponse(new Uint8Array(pdf), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${nomeArquivo(conta?.nome ?? "dattis", dpa.versao)}"` },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível gerar o PDF agora. Tenta de novo em alguns segundos." }, { status: 500 });
  }
}
