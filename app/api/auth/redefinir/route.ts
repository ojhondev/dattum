import { NextResponse } from "next/server";
import { criarSessao } from "@/lib/auth";
import { redefinirSenha } from "@/lib/senha";
import { problemaNaSenha } from "@/lib/validacao";
import { limitarIp, respostaLimite } from "@/lib/limite";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (await limitarIp(req, "redefinir", 10, 3600)) return respostaLimite(60);
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";
  const problema = problemaNaSenha(senha);
  if (problema) return NextResponse.json({ ok: false, error: problema }, { status: 400 });

  const agencia = await redefinirSenha(token, senha);
  if (!agencia) {
    return NextResponse.json({ ok: false, error: "Este link expirou ou já foi usado. Peça um novo." }, { status: 410 });
  }
  await criarSessao(agencia.id);
  return NextResponse.json({ ok: true });
}
