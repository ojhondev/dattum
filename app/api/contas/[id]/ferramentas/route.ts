import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { definirFerramentas } from "@/lib/contas";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

/** Grava as ferramentas marcadas no seletor (chaves do catálogo + nomes fora do catálogo). */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const b = await req.json().catch(() => null);
  const lista = (v: unknown, max: number) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim().slice(0, 80)).slice(0, max) : [];
  const chaves = lista(b?.chaves, 300);
  const personalizadas = lista(b?.personalizadas, 30);

  const r = await definirFerramentas(id, sessao.agenciaId, chaves, personalizadas);
  if (!r) return NextResponse.json({ ok: false, error: "Cliente não encontrado." }, { status: 404 });

  if (r.adicionadas || r.removidas) {
    await registrar(
      sessao,
      "Atualizou as ferramentas de um cliente",
      `${r.conta.nome} · ${r.adicionadas} adicionada(s), ${r.removidas} removida(s)${r.contrato === "nova_versao" ? " · nova versão do contrato" : ""}`,
    );
  }
  return NextResponse.json({ ok: true, contrato: r.contrato });
}
