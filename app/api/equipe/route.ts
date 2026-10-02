import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, usuarios } from "@/lib/db/schema";
import { ehDono, getSessao } from "@/lib/auth";
import { EMAIL_DEMO } from "@/lib/admin-dados";
import { emailEmUso, novoConvite } from "@/lib/equipe";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Convida uma pessoa da equipe (só o dono). Devolve o link de convite para mandar por WhatsApp ou e-mail. */
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  if (!ehDono(sessao)) return NextResponse.json({ ok: false, error: "Só o dono da conta gerencia a equipe." }, { status: 403 });
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, sessao.agenciaId), columns: { email: true } });
  if (agencia?.email === EMAIL_DEMO) return NextResponse.json({ ok: false, error: "A conta de demonstração não pode convidar pessoas." }, { status: 403 });

  const b = await req.json().catch(() => null);
  const nome = typeof b?.nome === "string" ? b.nome.trim().slice(0, 120) : "";
  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase().slice(0, 160) : "";
  if (!nome || !EMAIL.test(email)) return NextResponse.json({ ok: false, error: "Informe o nome e um e-mail válido." }, { status: 400 });
  if (await emailEmUso(email)) return NextResponse.json({ ok: false, error: "Esse e-mail já é usado em um login da Dattis." }, { status: 409 });

  const [u] = await db.insert(usuarios).values({ agenciaId: sessao.agenciaId, nome, email }).returning();
  const url = await novoConvite(u.id);
  await registrar(sessao, "Convidou uma pessoa para a equipe", `${nome} (${email})`);
  return NextResponse.json({ ok: true, url });
}
