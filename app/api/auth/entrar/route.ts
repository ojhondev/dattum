import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { limitarIp, excedeuLimite, respostaLimite } from "@/lib/limite";
import { verificarSenha, criarSessao } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if ((await limitarIp(req, "entrar", 20, 900)) || (email && (await excedeuLimite(`entrar:email:${email}`, 8, 900)))) return respostaLimite(15);
  const senha = typeof body?.senha === "string" ? body.senha : "";

  if (!email || !senha) {
    return NextResponse.json({ ok: false, error: "Informe e-mail e senha." }, { status: 400 });
  }

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.email, email) });
  if (!agencia || !(await verificarSenha(senha, agencia.senhaHash))) {
    return NextResponse.json({ ok: false, error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  await criarSessao(agencia.id);
  return NextResponse.json({ ok: true });
}
