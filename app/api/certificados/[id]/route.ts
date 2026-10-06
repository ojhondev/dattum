import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { certificados } from "@/lib/db/schema";
import { getSessao } from "@/lib/auth";
import { bloqueioDemo } from "@/lib/demo-bloqueio";

export const runtime = "nodejs";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false, error: "Não autenticado." }, { status: 401 });
  const demo = await bloqueioDemo(sessao.agenciaId);
  if (demo) return demo;
  const { id } = await params;

  const [cert] = await db
    .update(certificados)
    .set({ revogado: true })
    .where(and(eq(certificados.id, id), eq(certificados.agenciaId, sessao.agenciaId)))
    .returning();

  if (!cert) return NextResponse.json({ ok: false, error: "Certificado não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
