import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leadsAuditoria } from "@/lib/db/schema";

export const runtime = "nodejs";

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];

// Início da "Auditoria da sua agência": guarda responsável, agência e WhatsApp.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const nome = typeof body?.nome === "string" ? body.nome.trim().slice(0, 80) : "";
  const agencia = typeof body?.agencia === "string" ? body.agencia.trim().slice(0, 120) : "";
  const whatsapp = typeof body?.whatsapp === "string" ? body.whatsapp.replace(/\D/g, "") : "";

  if (nome.length < 2 || agencia.length < 2 || whatsapp.length < 10 || whatsapp.length > 13) {
    return NextResponse.json({ ok: false, error: "Preencha nome, agência e um WhatsApp com DDD." }, { status: 400 });
  }

  const utm: Record<string, string> = {};
  for (const k of UTM) {
    const v = body?.utm?.[k];
    if (typeof v === "string" && v.trim()) utm[k] = v.trim().slice(0, 120);
  }

  const [lead] = await db
    .insert(leadsAuditoria)
    .values({ nome, agencia, whatsapp, utm: Object.keys(utm).length ? utm : null })
    .returning({ id: leadsAuditoria.id });

  return NextResponse.json({ ok: true, id: lead.id });
}
