import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { ehDono, ehOperador, getSessao } from "@/lib/auth";
import { novoConvite } from "@/lib/equipe";
import { registrar } from "@/lib/registro";
import { bloqueioDemo } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";

async function alvo(id: string) {
  const sessao = await getSessao();
  if (!sessao) return { erro: NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 }) };
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return { erro: demo };
  if (!ehDono(sessao)) return { erro: NextResponse.json({ ok: false, error: "Só o dono da conta gerencia a equipe." }, { status: 403 }) };
  if (ehOperador(sessao)) return { erro: NextResponse.json({ ok: false, error: "O DPO da Dattis não altera login, senha, equipe nem aceita termos pela agência. Peça ao dono da conta." }, { status: 403 }) };
  const u = await db.query.usuarios.findFirst({ where: and(eq(usuarios.id, id), eq(usuarios.agenciaId, sessao.agenciaId)) });
  if (!u) return { erro: NextResponse.json({ ok: false, error: "Pessoa não encontrada." }, { status: 404 }) };
  return { sessao, u };
}

/** acao: "convite" (novo link) | "desativar" | "reativar" */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await alvo((await params).id);
  if (r.erro) return r.erro;
  const b = await req.json().catch(() => null);
  if (b?.acao === "convite") {
    const url = await novoConvite(r.u.id);
    await registrar(r.sessao, "Gerou novo link de convite", r.u.nome);
    return NextResponse.json({ ok: true, url });
  }
  if (b?.acao === "desativar" || b?.acao === "reativar") {
    await db.update(usuarios).set({ ativo: b.acao === "reativar" }).where(eq(usuarios.id, r.u.id));
    await registrar(r.sessao, b.acao === "reativar" ? "Reativou o acesso de uma pessoa" : "Desativou o acesso de uma pessoa", r.u.nome);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Ação desconhecida." }, { status: 400 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await alvo((await params).id);
  if (r.erro) return r.erro;
  await db.delete(usuarios).where(eq(usuarios.id, r.u.id));
  await registrar(r.sessao, "Removeu uma pessoa da equipe", `${r.u.nome} (${r.u.email})`);
  return NextResponse.json({ ok: true });
}
