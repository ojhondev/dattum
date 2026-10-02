import { strToU8, zipSync, type Zippable } from "fflate";
import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  agencias,
  atividadesTratamento,
  certificados,
  consentimentos,
  contaSubprocessadores,
  contasCliente,
  dpas,
  subprocessadoresCatalogo,
} from "@/lib/db/schema";
import { fluxosDaConta } from "@/lib/fluxos";
import { gerarDocumento, TIPOS_DOCUMENTO } from "@/lib/documentos";
import { htmlDoDpa } from "@/lib/dpa-pdf";
import { situacaoDpa } from "@/lib/dpa";
import { slugify } from "@/lib/markdown";

// "Exportar tudo": o pacote que os Termos prometem à agência (documentos, contratos assinados e
// evidências de assinatura). Arquivos abertos (CSV, JSON, HTML, Markdown), sem depender da Dattis.

const csv = (linhas: (string | number | boolean | null | undefined)[][]) =>
  "﻿" + linhas.map((l) => l.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
const dataBr = (d: Date | null | undefined) => (d ? d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "");

/** Tabelas extras entram aqui quando existirem (equipe, pedidos de titulares...). */
export type Anexo = { caminho: string; conteudo: string };

export async function gerarExportacao(agenciaId: string, anexos: Anexo[] = []) {
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId) });
  if (!agencia) return null;
  const contas = await db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, agenciaId), orderBy: (t, { asc }) => asc(t.createdAt) });
  const ids = contas.map((c) => c.id);
  const [atividades, subs, contratos, certs, consents] = await Promise.all([
    ids.length ? db.query.atividadesTratamento.findMany({ where: inArray(atividadesTratamento.contaClienteId, ids) }) : [],
    ids.length
      ? db
          .select({ conta: contaSubprocessadores.contaClienteId, custom: contaSubprocessadores.nomeCustomizado, finalidade: contaSubprocessadores.finalidade, nome: subprocessadoresCatalogo.nome, pais: subprocessadoresCatalogo.pais })
          .from(contaSubprocessadores)
          .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
          .where(and(inArray(contaSubprocessadores.contaClienteId, ids), eq(contaSubprocessadores.ativo, true)))
      : [],
    db.query.dpas.findMany({ where: eq(dpas.agenciaId, agenciaId), orderBy: (t, { asc }) => asc(t.versao) }),
    db.query.certificados.findMany({ where: eq(certificados.agenciaId, agenciaId) }),
    db.query.consentimentos.findMany({
      where: or(eq(consentimentos.agenciaId, agenciaId), ids.length ? inArray(consentimentos.contaClienteId, ids) : undefined),
      orderBy: (t, { asc }) => asc(t.criadoEm),
    }),
  ]);

  const arquivos: Zippable = {};
  const add = (caminho: string, texto: string) => (arquivos[caminho] = strToU8(texto));
  const pastas = new Map<string, string>();
  for (const c of contas) {
    let p = slugify(c.nome) || "cliente";
    while ([...pastas.values()].includes(p)) p += "-2";
    pastas.set(c.id, p);
  }

  add(
    "LEIA-ME.txt",
    [
      `Exportação de dados da ${agencia.nome} na Dattis`,
      `Gerada em ${dataBr(new Date())}`,
      "",
      "agencia.json ............ dados cadastrais da agência",
      "clientes/<cliente>/ ...... por cliente: dados, registro de atividades (RAT), ferramentas,",
      "                           contratos (todas as versões, com assinaturas e evidências) e documentos",
      "certificados.csv ........ certificados de privacidade emitidos",
      "consentimentos-cookies.csv  escolhas dos visitantes no aviso de cookies (prova de consentimento)",
      "",
      "Os contratos estão em HTML: abra no navegador e use Imprimir > Salvar como PDF se precisar.",
      "O resumo SHA-256 em cada contrato permite provar que o texto não mudou depois da assinatura.",
    ].join("\r\n"),
  );

  const { senhaHash: _s, googleSub: _g, toursVistos: _t, ...publico } = agencia;
  void _s;
  void _g;
  void _t;
  add("agencia.json", JSON.stringify(publico, null, 2));

  for (const c of contas) {
    const pasta = `clientes/${pastas.get(c.id)}`;
    const atv = atividades.filter((a) => a.contaClienteId === c.id);
    const fer = subs.filter((s) => s.conta === c.id).map((s) => ({ nome: s.nome ?? s.custom ?? "", pais: s.pais, finalidade: s.finalidade }));
    add(`${pasta}/dados.json`, JSON.stringify({ ...c, operacoes: fluxosDaConta(c).map((f) => f.titulo) }, null, 2));
    add(
      `${pasta}/registro-de-atividades.csv`,
      csv([["Atividade", "Categorias de dado", "Finalidade", "Base legal", "Titulares", "Prazo de retenção"], ...atv.map((a) => [a.nomeAtividade, a.categoriasDado, a.finalidade, a.baseLegal, a.titulares, a.prazoRetencao])]),
    );
    add(`${pasta}/ferramentas.csv`, csv([["Ferramenta", "País", "Finalidade"], ...fer.map((f) => [f.nome, f.pais, f.finalidade])]));

    for (const d of contratos.filter((x) => x.contaClienteId === c.id)) {
      const sufixo = situacaoDpa(d) === "assinado" ? "assinado" : "pendente";
      add(`${pasta}/contratos/contrato-v${d.versao}-${sufixo}.html`, htmlDoDpa(d, c.nome));
    }
    const dados = {
      agencia: { nome: agencia.nome, cnpj: agencia.cnpj, email: agencia.email },
      conta: { nome: c.nome, cnpj: c.cnpj, site: c.site, contatoNome: c.contatoNome, contatoEmail: c.contatoEmail, fluxos: fluxosDaConta(c).map((f) => f.key) },
      ferramentas: fer.map((f) => ({ nome: f.nome, pais: f.pais })),
    };
    for (const t of TIPOS_DOCUMENTO) add(`${pasta}/documentos/${t.id}.md`, `# ${t.titulo}\n\n${gerarDocumento(t.id, dados)}\n`);
  }

  const nomeConta = new Map(contas.map((c) => [c.id, c.nome]));
  add(
    "certificados.csv",
    csv([
      ["Código", "Titular", "Cliente", "Domínio", "Emitido em", "Válido até", "Revogado"],
      ...certs.map((c) => [c.codigo, c.titular, c.contaClienteId ? nomeConta.get(c.contaClienteId) : "(agência)", c.dominio, dataBr(c.emitidoEm), dataBr(c.validoAte), c.revogado ? "sim" : "não"]),
    ]),
  );
  add(
    "consentimentos-cookies.csv",
    csv([
      ["Data", "Site", "Visitante (id aleatório)", "Escolha", "Estatísticas", "Marketing", "Versão do aviso", "Página", "Hash do IP"],
      ...consents.map((x) => [dataBr(x.criadoEm), x.contaClienteId ? nomeConta.get(x.contaClienteId) : "(agência)", x.visitante, x.acao, x.categorias.estatisticas ? "sim" : "não", x.categorias.marketing ? "sim" : "não", x.versao, x.url, x.ipHash]),
    ]),
  );
  for (const a of anexos) add(a.caminho, a.conteudo);

  return { zip: zipSync(arquivos, { level: 6 }), nome: `dattis-${slugify(agencia.nome) || "agencia"}-${new Date().toISOString().slice(0, 10)}.zip` };
}

export { csv as paraCsv, dataBr };
