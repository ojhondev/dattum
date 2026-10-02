import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { gerarCobrancasDoMes } from "@/lib/cobranca";

export const runtime = "nodejs";

/**
 * acao "gerar": cria as mensalidades do mês que ainda faltam.
 * acao "config": dia de vencimento e link de pagamento de uma agência.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (b?.acao === "gerar") return NextResponse.json({ ok: true, ...(await gerarCobrancasDoMes()) });
  if (b?.acao === "config" && typeof b?.agenciaId === "string") {
    const dia = Number(b.diaVencimento);
    const link = typeof b.linkPagamento === "string" ? b.linkPagamento.trim().slice(0, 400) : "";
    if (!Number.isInteger(dia) || dia < 1 || dia > 28) return NextResponse.json({ ok: false, error: "Dia de vencimento entre 1 e 28." }, { status: 400 });
    if (link && !/^https:\/\//i.test(link)) return NextResponse.json({ ok: false, error: "O link de pagamento precisa começar com https://" }, { status: 400 });
    await db.update(agencias).set({ diaVencimento: dia, linkPagamento: link || null }).where(eq(agencias.id, b.agenciaId));
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Ação desconhecida." }, { status: 400 });
}
