import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { cadastrarFerramenta, ferramentasDaAgencia } from "@/lib/ferramentas-agencia";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

/** Ferramentas cadastradas pela própria agência. */
export async function GET() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  return NextResponse.json({ ok: true, ferramentas: await ferramentasDaAgencia(sessao.agenciaId) });
}

/** Cadastra uma ferramenta que a agência usa e não está no catálogo (nome, link e categoria). */
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const b = await req.json().catch(() => null);
  const r = await cadastrarFerramenta(sessao.agenciaId, {
    nome: typeof b?.nome === "string" ? b.nome : "",
    site: typeof b?.site === "string" ? b.site.slice(0, 300) : null,
    categoriaId: typeof b?.categoriaId === "string" ? b.categoriaId : "",
  });
  if ("erro" in r) return NextResponse.json({ ok: false, error: r.erro }, { status: 400 });
  await registrar(sessao, "Cadastrou uma ferramenta", `${r.ferramenta.nome} · ${r.ferramenta.categoria}`);
  return NextResponse.json({ ok: true, ferramenta: { id: r.ferramenta.id, chave: r.ferramenta.chave, nome: r.ferramenta.nome } });
}
