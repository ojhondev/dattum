import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leadsAuditoria } from "@/lib/db/schema";

export const runtime = "nodejs";

const RESPOSTAS = new Set(["sim", "parcial", "nao"]);
const NIVEIS = new Set(["Baixo", "Médio", "Alto", "Crítico"]);

// Grava o resultado da auditoria e/ou o clique em "Enviar resultado para especialista".
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ ok: false }, { status: 404 });

  const body = await req.json().catch(() => null);
  const set: Partial<typeof leadsAuditoria.$inferInsert> = {};

  if (body?.respostas && typeof body.respostas === "object") {
    const respostas: Record<string, string> = {};
    for (const [k, v] of Object.entries(body.respostas)) {
      if (/^[a-h]\d$/.test(k) && typeof v === "string" && RESPOSTAS.has(v)) respostas[k] = v;
    }
    set.respostas = respostas;
    set.concluidoEm = new Date();
    if (Number.isInteger(body.score) && body.score >= 0 && body.score <= 100) set.score = body.score;
    if (typeof body.nivel === "string" && NIVEIS.has(body.nivel)) set.nivel = body.nivel;
    if (typeof body.sinal === "string") set.sinalComercial = body.sinal.slice(0, 40);
  }
  if (body?.enviado === true) set.enviadoEspecialistaEm = new Date();

  if (Object.keys(set).length === 0) return NextResponse.json({ ok: false }, { status: 400 });

  const r = await db.update(leadsAuditoria).set(set).where(eq(leadsAuditoria.id, id)).returning({ id: leadsAuditoria.id });
  return NextResponse.json({ ok: r.length > 0 }, { status: r.length ? 200 : 404 });
}
