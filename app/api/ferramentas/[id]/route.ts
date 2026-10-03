import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { excluirFerramenta } from "@/lib/ferramentas-agencia";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const f = await excluirFerramenta(sessao.agenciaId, id);
  if (!f) return NextResponse.json({ ok: false, error: "Ferramenta não encontrada." }, { status: 404 });
  await registrar(sessao, "Excluiu uma ferramenta", f.nome);
  return NextResponse.json({ ok: true });
}
