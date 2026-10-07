import { NextResponse } from "next/server";
import { ehDono, ehOperador, getSessao } from "@/lib/auth";
import { aplicarCodigo } from "@/lib/ativacao";
import { limitarIp, respostaLimite } from "@/lib/limite";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

/** Conta em exploração aplica o código de ativação recebido depois do pagamento: plano ativo na hora. */
export async function POST(req: Request) {
  if (await limitarIp(req, "ativar-codigo", 10, 3600)) return respostaLimite(60);
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  if (!ehDono(sessao) || ehOperador(sessao)) return NextResponse.json({ ok: false, error: "Só o dono da conta aplica o código de ativação." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const codigo = typeof body?.codigo === "string" ? body.codigo.trim().toUpperCase().slice(0, 40) : "";
  const r = await aplicarCodigo(sessao.agenciaId, codigo);
  if (!r.ok) return NextResponse.json({ ok: false, error: r.erro }, { status: 400 });
  await registrar(sessao, "Ativou o plano com código de ativação", codigo);
  return NextResponse.json({ ok: true });
}
