import { and, count, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, cobrancas, contasCliente } from "@/lib/db/schema";
import { PLANOS } from "@/lib/planos";
import { EMAIL_DEMO } from "@/lib/admin-dados";

// Mensalidades das agências. A Dattis cobra por link de pagamento (fora da plataforma);
// aqui fica o controle: o que venceu, o que foi pago, quem avisar e quando suspender.

export const DIAS_PARA_SUSPENDER = 10; // Termos de Uso: suspensão após 10 dias do aviso

export const competenciaDe = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const nomeCompetencia = (c: string) => {
  const [a, m] = c.split("-").map(Number);
  return new Date(a, m - 1, 15).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export type Cobranca = typeof cobrancas.$inferSelect;
export type SituacaoCobranca = "paga" | "a_vencer" | "atrasada" | "cancelada";

export function situacaoCobranca(c: Pick<Cobranca, "status" | "vencimento">, agora = Date.now()): { situacao: SituacaoCobranca; diasAtraso: number } {
  if (c.status === "paga") return { situacao: "paga", diasAtraso: 0 };
  if (c.status === "cancelada") return { situacao: "cancelada", diasAtraso: 0 };
  const dias = Math.floor((agora - c.vencimento.getTime()) / 86_400_000);
  return dias > 0 ? { situacao: "atrasada", diasAtraso: dias } : { situacao: "a_vencer", diasAtraso: 0 };
}

/** Valor do mês: preço do plano × clientes contratados (ou ativos, se o plano não tiver limite). */
export function valorMensal(plano: string, contratados: number | null, ativos: number) {
  const preco = PLANOS.find((p) => p.id === plano)?.preco ?? 0;
  return preco * (contratados ?? ativos);
}

/**
 * Cria a mensalidade do mês para cada agência ativa que ainda não tem (idempotente).
 * Roda no cron diário e pelo botão do admin. A demo e as agências suspensas ficam de fora.
 */
export async function gerarCobrancasDoMes(ref = new Date()) {
  const competencia = competenciaDe(ref);
  const ags = await db.query.agencias.findMany({ where: and(ne(agencias.email, EMAIL_DEMO), eq(agencias.suspensa, false)) });
  if (!ags.length) return { criadas: 0 };
  const existentes = await db.select({ ag: cobrancas.agenciaId }).from(cobrancas).where(and(eq(cobrancas.competencia, competencia), inArray(cobrancas.agenciaId, ags.map((a) => a.id))));
  const ja = new Set(existentes.map((e) => e.ag));
  const ativos = await db.select({ ag: contasCliente.agenciaId, n: count() }).from(contasCliente).groupBy(contasCliente.agenciaId);
  const nAtivos = new Map(ativos.map((a) => [a.ag, Number(a.n)]));

  let criadas = 0;
  for (const a of ags) {
    if (ja.has(a.id)) continue;
    const valor = valorMensal(a.plano, a.clientesContratados, nAtivos.get(a.id) ?? 0);
    if (valor <= 0) continue;
    const dia = Math.min(Math.max(a.diaVencimento, 1), 28);
    const vencimento = new Date(ref.getFullYear(), ref.getMonth(), dia, 12);
    await db.insert(cobrancas).values({ agenciaId: a.id, competencia, valor, vencimento }).onConflictDoNothing();
    criadas++;
  }
  return { criadas };
}

/** Mensalidade vencida e em aberto mais antiga da agência (para o aviso no painel). */
export async function cobrancaAtrasada(agenciaId: string) {
  const abertas = await db.query.cobrancas.findMany({ where: and(eq(cobrancas.agenciaId, agenciaId), eq(cobrancas.status, "aberta")), orderBy: (t, { asc }) => asc(t.vencimento) });
  const agora = Date.now();
  return abertas.find((c) => situacaoCobranca(c, agora).situacao === "atrasada") ?? null;
}

export const brlCheio = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
