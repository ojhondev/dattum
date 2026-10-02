import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, contasCliente, dpas, certificados, codigosAtivacao } from "@/lib/db/schema";
import { PLANOS } from "@/lib/planos";
import { ultimosResultados } from "@/lib/vigilancia";

export const EMAIL_DEMO = "demo@dattis.com.br";

/** Visão por agência pro painel WebMaster: plano, carteira, contratos, certificados, vigilância e contato. */
export async function carregarAgencias() {
  const [ags, contasPor, assinadosPor, certsAtivos, codigos, resultados] = await Promise.all([
    db.select().from(agencias).orderBy(desc(agencias.createdAt)),
    db.select({ ag: contasCliente.agenciaId, n: count() }).from(contasCliente).groupBy(contasCliente.agenciaId),
    db.select({ ag: dpas.agenciaId, n: count() }).from(dpas).where(and(eq(dpas.status, "assinado"), isNull(dpas.substituidoEm))).groupBy(dpas.agenciaId),
    db.select({ ag: certificados.agenciaId, validoAte: certificados.validoAte, revogado: certificados.revogado }).from(certificados),
    db.select({ ag: codigosAtivacao.agenciaId, contato: codigosAtivacao.clienteContato }).from(codigosAtivacao),
    ultimosResultados(),
  ]);

  const mapa = <T extends { ag: string | null; n: number }>(rows: T[]) => new Map(rows.map((r) => [r.ag, Number(r.n)]));
  const nContas = mapa(contasPor);
  const nAssinados = mapa(assinadosPor);
  const agora = Date.now();

  return ags.map((a) => {
    const contas = nContas.get(a.id) ?? 0;
    const res = resultados.filter((r) => r.agenciaId === a.id);
    const notas = res.map((r) => r.nota);
    const preco = PLANOS.find((p) => p.id === a.plano)?.preco ?? 0;
    const demo = a.email === EMAIL_DEMO;
    return {
      id: a.id,
      nome: a.nome,
      email: a.email,
      plano: a.plano,
      planoNome: PLANOS.find((p) => p.id === a.plano)?.nome ?? a.plano,
      demo,
      suspensa: a.suspensa,
      criadaEm: a.createdAt,
      contas,
      contratados: a.clientesContratados,
      assinados: nAssinados.get(a.id) ?? 0,
      certificados: certsAtivos.filter((c) => c.ag === a.id && !c.revogado && c.validoAte.getTime() > agora).length,
      notaMedia: notas.length ? Math.round(notas.reduce((s, n) => s + n, 0) / notas.length) : null,
      criticos: res.reduce((s, r) => s + r.criticos, 0),
      altos: res.reduce((s, r) => s + r.altos, 0),
      contato: codigos.find((c) => c.ag === a.id && c.contato)?.contato ?? null,
      // Receita: preço do plano × clientes contratados (ou ativos, se o plano não tiver limite). Demo não conta.
      mrr: demo ? 0 : preco * (a.clientesContratados ?? contas),
    };
  });
}

export type AgenciaResumo = Awaited<ReturnType<typeof carregarAgencias>>[number];

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
