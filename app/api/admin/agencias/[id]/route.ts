import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { criarLinkRedefinicao } from "@/lib/senha";

export const runtime = "nodejs";

/**
 * Ações da equipe Dattis sobre uma agência:
 * - `link-senha`: gera um link de redefinição (vale 3 dias)
 * - `suspender` / `reativar`: bloqueia o painel (ex.: inadimplência); os dados ficam preservados
 * - `plano`: muda plano e quantidade de clientes contratados
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, id) });
  if (!agencia) return NextResponse.json({ ok: false, error: "Agência não encontrada." }, { status: 404 });

  switch (body?.acao) {
    case "link-senha": {
      const url = await criarLinkRedefinicao(agencia.id, "admin");
      return NextResponse.json({ ok: true, url, whatsapp: agencia.whatsapp });
    }
    case "suspender":
    case "reativar":
      await db.update(agencias).set({ suspensa: body.acao === "suspender" }).where(eq(agencias.id, agencia.id));
      return NextResponse.json({ ok: true });
    case "plano": {
      const plano = ["start", "growth", "scale"].includes(body?.plano) ? (body.plano as string) : null;
      const clientes = Number.isInteger(body?.clientes) && body.clientes >= 1 && body.clientes <= 1000 ? (body.clientes as number) : null;
      if (!plano || !clientes) return NextResponse.json({ ok: false, error: "Informe o plano e a quantidade de clientes (1 a 1000)." }, { status: 400 });
      await db.update(agencias).set({ plano, clientesContratados: clientes }).where(eq(agencias.id, agencia.id));
      return NextResponse.json({ ok: true });
    }
  }
  return NextResponse.json({ ok: false, error: "Ação desconhecida." }, { status: 400 });
}
