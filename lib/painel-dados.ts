import { and, count, desc, eq, gte, inArray, isNull } from "drizzle-orm";
import { dataAssinaturaCompleta } from "@/lib/dpa";
import { db } from "@/lib/db";
import {
  agencias,
  contasCliente,
  dpas,
  atividadesTratamento,
  contaSubprocessadores,
  subprocessadoresCatalogo,
  certificados,
  varreduraResultados,
} from "@/lib/db/schema";
import { fluxosDaConta, FLUXOS } from "@/lib/fluxos";
import { ultimosResultados } from "@/lib/vigilancia";
import { ordenarAchados, type Severidade } from "@/lib/vigilancia-tipos";
import { agoraMs } from "@/lib/utils";

const DIA = 86_400_000;
// Dia no fuso de Brasília (UTC−3), no formato AAAA-MM-DD.
const diaBrt = (d: Date) => new Date(d.getTime() - 3 * 3600_000).toISOString().slice(0, 10);

export type PontoSerie = { dia: string; rotulo: string; aprovadas: number; alertas: number };
export type Evento = { quando: Date; tipo: "conta" | "contrato" | "certificado" | "vigilancia"; titulo: string; conta: string; contaId: string | null; status: "ok" | "pendente" | "alerta"; detalhe: string };
export type Pendencia = { severidade: Severidade; conta: string; contaId: string; texto: string };

/** Tudo que o painel da agência mostra, calculado num lugar só. */
export async function dadosDoPainel(agenciaId: string, opts: { dias: number }) {
  const agora = agoraMs();
  const desde = new Date(agora - opts.dias * DIA);

  const [agencia, contas, todosDpas, resultados, certs, historico] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId) }),
    db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, agenciaId), orderBy: (t, { desc }) => desc(t.createdAt) }),
    db.query.dpas.findMany({ where: and(eq(dpas.agenciaId, agenciaId), isNull(dpas.substituidoEm)) }),
    ultimosResultados(agenciaId),
    db.query.certificados.findMany({ where: eq(certificados.agenciaId, agenciaId), orderBy: desc(certificados.emitidoEm) }),
    db
      .select()
      .from(varreduraResultados)
      .where(and(eq(varreduraResultados.agenciaId, agenciaId), gte(varreduraResultados.verificadoEm, desde)))
      .orderBy(varreduraResultados.verificadoEm),
  ]);
  const ids = contas.map((c) => c.id);

  const [ratRows, ferramentasRows] = ids.length
    ? await Promise.all([
        db.select({ conta: atividadesTratamento.contaClienteId, n: count() }).from(atividadesTratamento).where(inArray(atividadesTratamento.contaClienteId, ids)).groupBy(atividadesTratamento.contaClienteId),
        db
          .select({ conta: contaSubprocessadores.contaClienteId, custom: contaSubprocessadores.nomeCustomizado, catalogo: subprocessadoresCatalogo.nome })
          .from(contaSubprocessadores)
          .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
          .where(and(inArray(contaSubprocessadores.contaClienteId, ids), eq(contaSubprocessadores.ativo, true))),
      ])
    : [[], []];

  const dpaPor = new Map(todosDpas.map((d) => [d.contaClienteId, d]));
  const ratPor = new Map(ratRows.map((r) => [r.conta, Number(r.n)]));
  const vigPor = new Map(resultados.filter((r) => r.contaClienteId).map((r) => [r.contaClienteId as string, r]));
  const nomePor = new Map(contas.map((c) => [c.id, c.nome]));

  // ---------- indicadores ----------
  const total = contas.length;
  const assinados = contas.filter((c) => dpaPor.get(c.id)?.status === "assinado").length;
  const atividades = ratRows.reduce((s, r) => s + Number(r.n), 0);
  const novas30 = contas.filter((c) => agora - c.createdAt.getTime() < 30 * DIA).length;
  const assinados30 = todosDpas.filter((d) => {
    const em = dataAssinaturaCompleta(d);
    return em && agora - em.getTime() < 30 * DIA;
  }).length;

  const usoFerramenta = new Map<string, Set<string>>();
  for (const f of ferramentasRows) {
    const nome = f.custom ?? f.catalogo ?? "—";
    if (!usoFerramenta.has(nome)) usoFerramenta.set(nome, new Set());
    usoFerramenta.get(nome)!.add(f.conta);
  }
  const ferramentas = [...usoFerramenta.entries()].map(([nome, s]) => ({ nome, contas: s.size })).sort((a, b) => b.contas - a.contas);

  const certsAtivos = certs.filter((c) => !c.revogado && c.validoAte.getTime() > agora);
  const proximoVencimento = certsAtivos.map((c) => c.validoAte).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
  const certsAuto = certsAtivos.filter((c) => c.automatico).length;

  const notas = contas.map((c) => vigPor.get(c.id)?.nota).filter((n): n is number => n != null);
  const notaMedia = notas.length ? Math.round(notas.reduce((s, n) => s + n, 0) / notas.length) : null;
  const alertas = resultados.reduce((s, r) => ({ criticos: s.criticos + r.criticos, altos: s.altos + r.altos, medios: s.medios + r.medios }), { criticos: 0, altos: 0, medios: 0 });

  const situacao = contas.map((c) => {
    const vig = vigPor.get(c.id);
    const assinado = dpaPor.get(c.id)?.status === "assinado";
    const rat = ratPor.get(c.id) ?? 0;
    const estado: "em-dia" | "pendente" | "critico" = (vig?.criticos ?? 0) > 0 ? "critico" : assinado && rat > 0 ? "em-dia" : "pendente";
    return { conta: c, vig, assinado, rat, estado, fluxos: fluxosDaConta(c) };
  });
  const emDia = situacao.filter((s) => s.estado === "em-dia").length;
  const criticos = situacao.filter((s) => s.estado === "critico").length;
  const pendentes = total - emDia - criticos;

  // ---------- série diária da vigilância (último resultado de cada alvo por dia) ----------
  const porDia = new Map<string, Map<string, (typeof historico)[number]>>();
  for (const r of historico) {
    const d = diaBrt(r.verificadoEm);
    if (!porDia.has(d)) porDia.set(d, new Map());
    porDia.get(d)!.set(r.contaClienteId ?? `ag:${r.alvo}`, r);
  }
  const serie: PontoSerie[] = [];
  for (let i = opts.dias - 1; i >= 0; i--) {
    const dataDia = new Date(agora - i * DIA);
    const d = diaBrt(dataDia);
    const doDia = [...(porDia.get(d)?.values() ?? [])];
    serie.push({
      dia: d,
      rotulo: new Date(`${d}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).replace(".", ""),
      aprovadas: doDia.reduce((s, r) => s + r.achados.filter((a) => a.severidade === "ok").length, 0),
      alertas: doDia.reduce((s, r) => s + r.criticos + r.altos + r.medios, 0),
    });
  }
  const diasComDados = serie.filter((p) => p.aprovadas + p.alertas > 0).length;

  // ---------- atividade recente ----------
  const eventos: Evento[] = [];
  for (const c of contas) eventos.push({ quando: c.createdAt, tipo: "conta", titulo: "Conta ativada", conta: c.nome, contaId: c.id, status: "ok", detalhe: `${fluxosDaConta(c).length} operação(ões) de tráfego mapeada(s)` });
  for (const d of todosDpas) {
    const conta = nomePor.get(d.contaClienteId) ?? "—";
    const completo = dataAssinaturaCompleta(d);
    if (completo) eventos.push({ quando: completo, tipo: "contrato", titulo: "Contrato assinado pelas duas partes", conta, contaId: d.contaClienteId, status: "ok", detalhe: `${d.clienteNome ?? ""}${d.clienteCargo ? `, ${d.clienteCargo}` : ""}` });
    else if (d.clienteAssinadoEm) eventos.push({ quando: d.clienteAssinadoEm, tipo: "contrato", titulo: "Cliente assinou o contrato", conta, contaId: d.contaClienteId, status: "pendente", detalhe: "Falta a assinatura da agência" });
    else if (d.assinadoEm) eventos.push({ quando: d.assinadoEm, tipo: "contrato", titulo: "Agência assinou o contrato", conta, contaId: d.contaClienteId, status: "pendente", detalhe: "Falta o cliente assinar pelo link" });
    else eventos.push({ quando: d.createdAt, tipo: "contrato", titulo: d.versao > 1 ? `Contrato atualizado (versão ${d.versao})` : "Contrato gerado", conta, contaId: d.contaClienteId, status: "pendente", detalhe: "Aguardando assinaturas" });
  }
  for (const c of certs) eventos.push({ quando: c.emitidoEm, tipo: "certificado", titulo: c.automatico ? "Certificado emitido automaticamente" : "Certificado emitido", conta: c.titular, contaId: c.contaClienteId, status: c.revogado ? "alerta" : "ok", detalhe: c.codigo });
  for (const r of resultados) {
    const pior = ordenarAchados(r.achados).find((a) => a.severidade !== "ok");
    eventos.push({ quando: r.verificadoEm, tipo: "vigilancia", titulo: `Vigilância: nota ${r.nota}`, conta: r.titular, contaId: r.contaClienteId, status: r.criticos + r.altos > 0 ? "alerta" : "ok", detalhe: pior ? pior.titulo : "Nenhum alerta" });
  }
  eventos.sort((a, b) => b.quando.getTime() - a.quando.getTime());

  // ---------- pendências ----------
  const pendencias: Pendencia[] = [];
  for (const s of situacao) {
    const base = { conta: s.conta.nome, contaId: s.conta.id };
    for (const a of ordenarAchados(s.vig?.achados ?? []).filter((a) => a.severidade === "critico" && a.grupo === "site")) pendencias.push({ ...base, severidade: "critico", texto: a.titulo });
    if (!s.assinado) pendencias.push({ ...base, severidade: "alto", texto: "Contrato aguardando assinatura da agência e do cliente" });
    if (s.rat === 0) pendencias.push({ ...base, severidade: "alto", texto: "Registro de tratamento vazio" });
    if (!s.conta.site) pendencias.push({ ...base, severidade: "medio", texto: "Site não cadastrado" });
  }
  const ordem: Severidade[] = ["critico", "alto", "medio", "ok"];
  pendencias.sort((a, b) => ordem.indexOf(a.severidade) - ordem.indexOf(b.severidade));

  const usoFluxo = FLUXOS.map((f) => ({ fluxo: f, n: situacao.filter((s) => s.fluxos.some((x) => x.key === f.key)).length }));

  return {
    agencia,
    total,
    assinados,
    atividades,
    novas30,
    assinados30,
    ferramentas,
    certsAtivos: certsAtivos.length,
    certsAuto,
    proximoVencimento,
    notaMedia,
    alertas,
    situacao,
    emDia,
    criticos,
    pendentes,
    serie,
    diasComDados,
    eventos,
    pendencias,
    usoFluxo,
    ultimaVerificacao: resultados.reduce<Date | null>((m, r) => (!m || r.verificadoEm > m ? r.verificadoEm : m), null),
  };
}
