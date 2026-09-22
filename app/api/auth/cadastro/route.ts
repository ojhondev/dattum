import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { hashSenha, criarSessao } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const senha = typeof body?.senha === "string" ? body.senha : "";

  if (!nome || !email || senha.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Preencha nome, e-mail e uma senha com pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const existente = await db.query.agencias.findFirst({ where: eq(agencias.email, email) });
  if (existente) {
    return NextResponse.json(
      { ok: false, error: "Já existe uma conta com esse e-mail. Tenta entrar." },
      { status: 409 }
    );
  }

  const senhaHash = await hashSenha(senha);
  const [agencia] = await db.insert(agencias).values({ nome, email, senhaHash }).returning();

  await criarSessao(agencia.id);

  return NextResponse.json({ ok: true });
}
