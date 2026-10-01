import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { criarLinkRedefinicao } from "@/lib/senha";

export const runtime = "nodejs";

/** Ações da equipe Dattis sobre uma agência. `acao: "link-senha"` gera um link de redefinição (vale 3 dias). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, id) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });

  if (body?.acao === "link-senha") {
    const url = await criarLinkRedefinicao(agencia.id, "admin");
    return NextResponse.json({ ok: true, url, whatsapp: agencia.whatsapp });
  }
  return NextResponse.json({ ok: false, error: "Ação desconhecida." }, { status: 400 });
}
