import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, atividadesTratamento, certificados, contaSubprocessadores, contasCliente, subprocessadoresCatalogo, varreduraResultados } from "@/lib/db/schema";
import { dataAssinaturaCompleta, dpaVigente, situacaoDpa, ROTULO_SITUACAO } from "@/lib/dpa";
import { statusCertificado } from "@/lib/certificados";
import { fluxosDaConta } from "@/lib/fluxos";
import { faixaDaNota, ordenarAchados } from "@/lib/vigilancia-tipos";

// DAT — resumo de conformidade que a agência manda pro cliente. Sempre com os dados do momento.

export type ItemDat = { titulo: string; ok: boolean; resumo: string; detalhes: string[] };

export type Dat = {
  conta: { id: string; nome: string; cnpj: string | null; site: string | null };
  agencia: { nome: string; cnpj: string | null };
  emDia: boolean;
  geradoEm: Date;
  operacoes: { titulo: string; comoChamam: string }[];
  itens: ItemDat[];
  pendencias: string[];
  certificado: { codigo: string; validoAte: Date } | null;
};

const data = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export async function montarDat(contaId: string): Promise<Dat | null> {
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, contaId) });
  if (!conta) return null;

  const [agencia, atividades, dpa, subs, vig, cert] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, conta.agenciaId) }),
    db.query.atividadesTratamento.findMany({ where: eq(atividadesTratamento.contaClienteId, contaId), orderBy: (t, { asc }) => asc(t.createdAt) }),
    dpaVigente(contaId),
    db
      .select({ custom: contaSubprocessadores.nomeCustomizado, nome: subprocessadoresCatalogo.nome, pais: subprocessadoresCatalogo.pais })
      .from(contaSubprocessadores)
      .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
      .where(and(eq(contaSubprocessadores.contaClienteId, contaId), eq(contaSubprocessadores.ativo, true))),
    db.query.varreduraResultados.findFirst({ where: eq(varreduraResultados.contaClienteId, contaId), orderBy: desc(varreduraResultados.verificadoEm) }),
    db.query.certificados.findFirst({
      where: and(eq(certificados.contaClienteId, contaId), eq(certificados.revogado, false)),
      orderBy: desc(certificados.validoAte),
    }),
  ]);
  if (!agencia) return null;

  const pendencias: string[] = [];
  const itens: ItemDat[] = [];

  // 1. Registro de atividades
  itens.push({
    titulo: "Registro do que é feito com os dados (RAT)",
    ok: atividades.length > 0,
    resumo: atividades.length ? `${atividades.length} atividade(s) registrada(s), com finalidade e base legal` : "Nenhuma atividade registrada",
    detalhes: atividades.map((a) => a.nomeAtividade),
  });
  if (!atividades.length) pendencias.push("Registrar as atividades de tratamento de dados desta conta.");

  // 2. Contrato
  const situacao = dpa ? situacaoDpa(dpa) : null;
  const completo = dpa ? dataAssinaturaCompleta(dpa) : null;
  itens.push({
    titulo: "Contrato de dados entre agência e empresa (DPA)",
    ok: situacao === "assinado",
    resumo: !dpa ? "Contrato ainda não gerado" : completo ? `Assinado pelas duas partes em ${data(completo)} (versão ${dpa.versao})` : ROTULO_SITUACAO[situacao!],
    detalhes: dpa && completo ? [`Pela agência: ${dpa.assinanteNome ?? "—"}`, `Pela empresa: ${dpa.clienteNome ?? "—"}`] : [],
  });
  if (situacao === "aguarda_cliente" || situacao === "rascunho") pendencias.push("Assinar o contrato de dados pelo link enviado pela agência.");
  if (situacao === "aguarda_agencia" || situacao === "rascunho") pendencias.push("A agência assinar o contrato de dados.");

  // 3. Ferramentas
  itens.push({
    titulo: "Ferramentas que tratam os dados",
    ok: true,
    resumo: subs.length ? `${subs.length} ferramenta(s) mapeada(s)` : "Nenhuma ferramenta de terceiros mapeada",
    detalhes: subs.map((s) => (s.nome ? `${s.nome}${s.pais ? ` (${s.pais})` : ""}` : (s.custom ?? "—"))),
  });

  // 4. Vigilância do site
  if (vig) {
    const faixa = faixaDaNota(vig.nota);
    const abertos = ordenarAchados(vig.achados).filter((a) => a.severidade !== "ok" && a.grupo === "site");
    itens.push({
      titulo: "Segurança e privacidade do site",
      ok: faixa.severidade === "ok",
      resumo: `Nota ${vig.nota}/100 (${faixa.label}) na verificação de ${data(vig.verificadoEm)}`,
      detalhes: abertos.slice(0, 4).map((a) => `A corrigir: ${a.titulo}`),
    });
    for (const a of abertos.filter((a) => a.severidade === "critico" || a.severidade === "alto").slice(0, 3)) pendencias.push(`Site: ${a.titulo}.`);
  } else if (conta.site) {
    itens.push({ titulo: "Segurança e privacidade do site", ok: true, resumo: "Site cadastrado; a primeira verificação sai na próxima varredura diária", detalhes: [] });
  }

  // 5. Certificado
  const certStatus = cert ? await statusCertificado(cert) : null;
  const certOk = !!cert && !!certStatus?.emDia;
  itens.push({
    titulo: "Certificado de privacidade de dados",
    ok: certOk,
    resumo: certOk && cert ? `Válido até ${data(cert.validoAte)}, código ${cert.codigo}` : "Emitido automaticamente quando os itens acima estiverem completos",
    detalhes: [],
  });

  return {
    conta: { id: conta.id, nome: conta.nome, cnpj: conta.cnpj, site: conta.site },
    agencia: { nome: agencia.nome, cnpj: agencia.cnpj },
    emDia: itens.every((i) => i.ok),
    geradoEm: new Date(),
    operacoes: fluxosDaConta(conta).map((f) => ({ titulo: f.titulo, comoChamam: f.comoChamam })),
    itens,
    pendencias: [...new Set(pendencias)],
    certificado: certOk && cert ? { codigo: cert.codigo, validoAte: cert.validoAte } : null,
  };
}
