import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { VERSAO_LEGAL } from "@/lib/legal";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

/** Registra o aceite da versão atual dos Termos, da Privacidade e do Contrato de dados. */
export async function POST() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  await db.update(agencias).set({ termosVersao: VERSAO_LEGAL, termosAceitosEm: new Date() }).where(eq(agencias.id, sessao.agenciaId));
  await registrar(sessao, "Aceitou os documentos legais da Dattis", `Versão ${VERSAO_LEGAL}`);
  return NextResponse.json({ ok: true });
}
