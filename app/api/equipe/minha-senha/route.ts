import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { getSessao, hashSenha, verificarSenha } from "@/lib/auth";
import { registrar } from "@/lib/registro";
import { problemaNaSenha } from "@/lib/validacao";
import { bloqueioDemo } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";

/** Pessoa da equipe troca a própria senha (o dono usa /api/agencia/senha). */
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao?.usuarioId) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return demo;
  const b = await req.json().catch(() => null);
  const atual = typeof b?.atual === "string" ? b.atual : "";
  const nova = typeof b?.nova === "string" ? b.nova : "";
  if (problemaNaSenha(nova)) return NextResponse.json({ ok: false, error: problemaNaSenha(nova) }, { status: 400 });
  const u = await db.query.usuarios.findFirst({ where: eq(usuarios.id, sessao.usuarioId) });
  if (!u?.senhaHash || !(await verificarSenha(atual, u.senhaHash))) return NextResponse.json({ ok: false, error: "A senha atual não confere." }, { status: 403 });
  await db.update(usuarios).set({ senhaHash: await hashSenha(nova) }).where(eq(usuarios.id, u.id));
  await registrar(sessao, "Trocou a própria senha");
  return NextResponse.json({ ok: true });
}
