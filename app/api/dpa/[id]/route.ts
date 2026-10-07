import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { dpas } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { bloqueioExploracao } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const exploracao = await bloqueioExploracao(sessao.agenciaId);
  if (exploracao) return exploracao;

  const { id } = await params;
  const dpa = await db.query.dpas.findFirst({
    where: and(eq(dpas.id, id), eq(dpas.agenciaId, sessao.agenciaId)),
  });

  if (!dpa) return NextResponse.json({ ok: false, error: "DPA não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true, dpa });
}
