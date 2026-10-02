import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { gerarExportacao } from "@/lib/exportacao";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Baixa tudo da agência num .zip (documentos, contratos com evidências, certificados, consentimentos). */
export async function GET() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const r = await gerarExportacao(sessao.agenciaId);
  if (!r) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });
  return new Response(new Uint8Array(r.zip), {
    headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${r.nome}"`, "Cache-Control": "no-store" },
  });
}
