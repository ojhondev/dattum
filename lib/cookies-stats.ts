import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { consentimentos } from "@/lib/db/schema";

export type EstatisticaCookies = { total: number; aceitar: number; recusar: number; personalizar: number };

/** Escolhas dos visitantes nos últimos 30 dias (a prova de consentimento, resumida). */
export async function estatisticaCookies(token: string | null): Promise<EstatisticaCookies | null> {
  if (!token) return null;
  const desde = new Date(Date.now() - 30 * 86_400_000);
  const rows = await db
    .select({ acao: consentimentos.acao, n: count() })
    .from(consentimentos)
    .where(and(eq(consentimentos.token, token), gte(consentimentos.criadoEm, desde)))
    .groupBy(consentimentos.acao);
  const por = (a: string) => Number(rows.find((r) => r.acao === a)?.n ?? 0);
  const e = { aceitar: por("aceitar"), recusar: por("recusar"), personalizar: por("personalizar") };
  return { ...e, total: e.aceitar + e.recusar + e.personalizar };
}
