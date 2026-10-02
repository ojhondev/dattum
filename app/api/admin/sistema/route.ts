import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { erros } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { fazerBackup } from "@/lib/backup";

export const runtime = "nodejs";
export const maxDuration = 300;

/** acao "backup": cópia agora · acao "resolver": marca um erro como resolvido (volta se acontecer de novo). */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (b?.acao === "backup") {
    const r = await fazerBackup().catch((e) => ({ ok: false as const, erro: String(e) }));
    return NextResponse.json(r.ok ? r : { ok: false, error: r.erro });
  }
  if (b?.acao === "resolver" && typeof b?.assinatura === "string") {
    await db.update(erros).set({ resolvido: true }).where(eq(erros.assinatura, b.assinatura));
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Ação desconhecida." }, { status: 400 });
}
