import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { limitarIp, respostaLimite } from "@/lib/limite";
import { verificarCnpjAgencia } from "@/lib/cnpj";

export const runtime = "nodejs";

/** Confere o CNPJ da agência na Receita antes de salvar (onboarding): válido, ativo e com o nome da agência. */
export async function POST(req: Request) {
  if (await limitarIp(req, "cnpj", 30, 3600)) return respostaLimite(60);
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const cnpj = typeof body?.cnpj === "string" ? body.cnpj.slice(0, 30) : "";
  const nome = typeof body?.nome === "string" ? body.nome.trim().slice(0, 120) : "";
  if (!nome) return NextResponse.json({ ok: false, error: "Informe o nome da agência." }, { status: 400 });
  const v = await verificarCnpjAgencia(cnpj, nome);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.erro }, { status: 400 });
  return NextResponse.json({ ok: true, endereco: v.receita?.endereco ?? null, razaoSocial: v.receita?.razaoSocial ?? null });
}
