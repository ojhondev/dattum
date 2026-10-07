import { NextResponse } from "next/server";
import { ehDono, getSessao } from "@/lib/auth";
import { registrar } from "@/lib/registro";
import { anexosDaEquipe } from "@/lib/exportacao-extra";
import { gerarExportacao } from "@/lib/exportacao";
import { bloqueioExploracao } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Baixa tudo da agência num .zip (documentos, contratos com evidências, certificados, consentimentos). */
export async function GET() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  if (!ehDono(sessao)) return NextResponse.json({ ok: false, error: "Só o dono da conta pode exportar todos os dados." }, { status: 403 });
  // O .zip leva os contratos completos: em exploração eles ficam travados (ver lib/previa.ts).
  const exploracao = await bloqueioExploracao(sessao.agenciaId);
  if (exploracao) return exploracao;
  const r = await gerarExportacao(sessao.agenciaId, await anexosDaEquipe(sessao.agenciaId));
  await registrar(sessao, "Exportou todos os dados da agência");
  if (!r) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });
  return new Response(new Uint8Array(r.zip), {
    headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${r.nome}"`, "Cache-Control": "no-store" },
  });
}
