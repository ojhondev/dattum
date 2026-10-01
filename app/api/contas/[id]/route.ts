import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { contasCliente } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { normalizarSite } from "@/lib/contas";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  const deletado = await db
    .delete(contasCliente)
    .where(and(eq(contasCliente.id, id), eq(contasCliente.agenciaId, sessao.agenciaId)))
    .returning();

  if (deletado.length === 0) {
    return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

// Atualiza o site do cliente (usado pela vigilância diária).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const bruto = typeof body?.site === "string" ? body.site.trim() : "";
  const site = bruto ? normalizarSite(bruto) : null;
  if (bruto && !site) {
    return NextResponse.json({ ok: false, error: "Esse endereço não parece um site válido (ex.: lojaaurora.com.br)." }, { status: 400 });
  }

  const [conta] = await db
    .update(contasCliente)
    .set({ site })
    .where(and(eq(contasCliente.id, id), eq(contasCliente.agenciaId, sessao.agenciaId)))
    .returning();
  if (!conta) return NextResponse.json({ ok: false, error: "Conta não encontrada." }, { status: 404 });

  return NextResponse.json({ ok: true, site: conta.site });
}
