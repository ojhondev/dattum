import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cobrancas } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** Marca a mensalidade como paga, reabre ou cancela. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const b = await req.json().catch(() => null);
  const status = ["paga", "aberta", "cancelada"].includes(b?.status) ? (b.status as string) : null;
  if (!status) return NextResponse.json({ ok: false, error: "Situação inválida." }, { status: 400 });
  const [c] = await db
    .update(cobrancas)
    .set({ status, pagaEm: status === "paga" ? new Date() : null, observacao: typeof b?.observacao === "string" ? b.observacao.slice(0, 300) : undefined })
    .where(eq(cobrancas.id, id))
    .returning();
  if (!c) return NextResponse.json({ ok: false, error: "Cobrança não encontrada." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
