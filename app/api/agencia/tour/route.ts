import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { TOURS } from "@/lib/tour";

export const runtime = "nodejs";

/** Marca um tour guiado como visto (concluído ou pulado), para não abrir sozinho de novo. */
export async function POST(req: Request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!TOURS.some((t) => t.id === id)) return NextResponse.json({ ok: false, error: "Tour desconhecido." }, { status: 400 });

  await db
    .update(agencias)
    .set({ toursVistos: sql`case when ${agencias.toursVistos} @> ${JSON.stringify([id])}::jsonb then ${agencias.toursVistos} else ${agencias.toursVistos} || ${JSON.stringify([id])}::jsonb end` })
    .where(eq(agencias.id, sessao.agenciaId));
  return NextResponse.json({ ok: true });
}
