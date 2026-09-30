import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { codigosAtivacao } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** Revoga um código ainda não usado. */
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const { id } = await params;

  const [cod] = await db
    .update(codigosAtivacao)
    .set({ revogado: true })
    .where(and(eq(codigosAtivacao.id, id), isNull(codigosAtivacao.usadoEm)))
    .returning();

  if (!cod) return NextResponse.json({ ok: false, error: "Código não encontrado ou já usado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
