import { NextResponse } from "next/server";
import { criarSessao } from "@/lib/auth";
import { redefinirSenha } from "@/lib/senha";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";
  if (senha.length < 8) return NextResponse.json({ ok: false, error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });

  const agencia = await redefinirSenha(token, senha);
  if (!agencia) {
    return NextResponse.json({ ok: false, error: "Este link expirou ou já foi usado. Peça um novo." }, { status: 410 });
  }
  await criarSessao(agencia.id);
  return NextResponse.json({ ok: true });
}
