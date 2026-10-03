import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";

export const runtime = "nodejs";

/** Marca o preenchimento guiado como concluído (ou pulado): o painel deixa de abrir o /painel/comecar sozinho. */
export async function POST() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  await db.update(agencias).set({ onboardingConcluidoEm: new Date() }).where(eq(agencias.id, sessao.agenciaId));
  return NextResponse.json({ ok: true });
}
