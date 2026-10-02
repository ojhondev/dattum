import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, atividadesTratamento, certificados, contaSubprocessadores, contasCliente, subprocessadoresCatalogo } from "@/lib/db/schema";
import { dataAssinaturaCompleta, dpaVigente } from "@/lib/dpa";
import { statusCertificado } from "@/lib/certificados";
import { fluxosDaConta, type FlowKey } from "@/lib/fluxos";
import { slugify } from "@/lib/markdown";
import { formatarTelefone, linkWhatsappPara } from "@/lib/contato";

// Política de privacidade pública, hospedada pela Dattis em /p/{slug}/privacidade.
// A da conta de cliente tem o CLIENTE como controlador; a da agência cobre a própria operação dela.

export type Ferramenta = { nome: string; finalidade: string; pais: string };
export type PoliticaPublica = {
  tipo: "agencia" | "conta";
  titular: string; // quem é o controlador (nome que aparece no topo)
  site: string | null;
  markdown: string;
  atualizadaEm: Date;
  certificado: { codigo: string } | null;
};

// Na política do cliente, o registro (escrito do ponto de vista da agência) vira a voz da própria empresa.
const SITUACAO: Record<FlowKey, string> = {
  publicos: "Listas de clientes para anúncios",
  capi: "Envio de compras e cadastros às plataformas de anúncio",
  ads: "Cookies, pixel e tags de anúncio no site",
  formularios: "Formulários de cadastro e de anúncios",
  whatsapp: "Atendimento pelo WhatsApp",
  crm: "Cadastro em CRM e automações",
};
const vozDaEmpresa = (s: string) =>
  s
    .replace(/,? em nome do cliente\b/gi, "")
    .replace(/\s*\(cliente\)/gi, "")
    .replace(/\bentre agência e cliente\b/gi, "entre a empresa e a agência")
    .replace(/\bdo cliente final\b/gi, "da empresa")
    .replace(/\bdo cliente\b/gi, "da empresa");

const situacaoDe = (a: { fluxo: string | null; nomeAtividade: string }) =>
  (a.fluxo && SITUACAO[a.fluxo as FlowKey]) || vozDaEmpresa(a.nomeAtividade);

const data = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const celula = (s: string) => s.replace(/\|/g, "/").replace(/\n/g, " ");
const hostDe = (site: string | null) => {
  try {
    return site ? new URL(site).host.replace(/^www\./, "") : null;
  } catch {
    return null;
  }
};

/** Canal do titular: e-mail de privacidade, ou o e-mail/WhatsApp de contato. */
function canal(email: string | null, whatsapp: string | null) {
  const partes: string[] = [];
  if (email) partes.push(`pelo e-mail [${email}](mailto:${email})`);
  const wa = linkWhatsappPara(whatsapp, "Olá! Tenho um pedido sobre meus dados pessoais.");
  if (wa) partes.push(`pelo WhatsApp [${formatarTelefone(whatsapp)}](${wa})`);
  return partes.length ? partes.join(" ou ") : "pelos canais de atendimento informados no site";
}

const DIREITOS = `Pelo art. 18 da LGPD, você pode pedir a qualquer momento:

- a confirmação de que tratamos seus dados e o acesso a eles;
- a correção de dados incompletos, inexatos ou desatualizados;
- a anonimização, o bloqueio ou a eliminação de dados desnecessários ou excessivos;
- a portabilidade dos dados;
- a informação sobre com quem compartilhamos seus dados;
- a revogação do consentimento e a eliminação dos dados tratados com base nele;
- não receber mais comunicações de marketing.`;

function tabelaFerramentas(fs: Ferramenta[]) {
  return `| Ferramenta | Para quê | Onde ficam os dados |
| --- | --- | --- |
${fs.map((f) => `| ${celula(f.nome)} | ${celula(f.finalidade)} | ${celula(f.pais)} |`).join("\n")}`;
}

const foraDoBrasil = (fs: Ferramenta[]) => fs.some((f) => f.pais && !/brasil/i.test(f.pais) && f.pais !== "—");

async function ferramentasDe(contaIds: string[]): Promise<Ferramenta[]> {
  if (!contaIds.length) return [];
  const rows = await db
    .select({ custom: contaSubprocessadores.nomeCustomizado, finalidade: contaSubprocessadores.finalidade, nome: subprocessadoresCatalogo.nome, pais: subprocessadoresCatalogo.pais })
    .from(contaSubprocessadores)
    .leftJoin(subprocessadoresCatalogo, eq(contaSubprocessadores.subprocessadorCatalogoId, subprocessadoresCatalogo.id))
    .where(and(inArray(contaSubprocessadores.contaClienteId, contaIds), eq(contaSubprocessadores.ativo, true)));
  const vistos = new Map<string, Ferramenta>();
  for (const r of rows) {
    const nome = r.nome ?? r.custom ?? "";
    if (nome && !vistos.has(nome)) vistos.set(nome, { nome, finalidade: r.finalidade, pais: r.pais ?? "—" });
  }
  return [...vistos.values()];
}

async function certificadoValido(where: ReturnType<typeof and>) {
  const cert = await db.query.certificados.findFirst({ where });
  if (!cert) return null;
  const st = await statusCertificado(cert);
  return st.emDia ? { codigo: cert.codigo } : null;
}

// ---------------------------------------------------------------------------------------------

export async function politicaDaConta(contaId: string): Promise<PoliticaPublica | null> {
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.id, contaId) });
  if (!conta) return null;
  const [agencia, atividades, ferramentas, dpa, certificado] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.id, conta.agenciaId) }),
    db.query.atividadesTratamento.findMany({ where: eq(atividadesTratamento.contaClienteId, contaId), orderBy: (t, { asc }) => asc(t.createdAt) }),
    ferramentasDe([contaId]),
    dpaVigente(contaId),
    certificadoValido(and(eq(certificados.contaClienteId, contaId), eq(certificados.revogado, false))),
  ]);
  if (!agencia) return null;

  const fluxos = new Set<FlowKey>(fluxosDaConta(conta).map((f) => f.key));
  const host = hostDe(conta.site);
  const contratoEm = dpa ? dataAssinaturaCompleta(dpa) : null;
  const canalTitular = canal(conta.emailPrivacidade ?? conta.contatoEmail, conta.contatoWhatsapp);
  const datas = [conta.politicaPublicadaEm ?? conta.createdAt, ...atividades.map((a) => a.updatedAt), ...(dpa ? [dpa.createdAt] : [])];
  const atualizadaEm = new Date(Math.max(...datas.map((d) => d.getTime())));

  const md: string[] = [];
  md.push(
    `Esta Política explica como **${conta.nome}**${conta.cnpj ? `, CNPJ ${conta.cnpj},` : ""} trata os dados pessoais de quem ${host ? `visita o site [${host}](${conta.site})` : "acessa nossos canais"}, preenche nossos formulários, fala com a gente ou vê nossos anúncios. Seguimos a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, "LGPD").`,
  );

  md.push(`## Quem cuida dos seus dados

A **${conta.nome}** é a controladora dos seus dados: é quem decide como e para que eles são usados.

Para campanhas de anúncio, atendimento e automações, contamos com a agência **${agencia.nome}**. Ela trata dados em nosso nome, como operadora, e segue as nossas instruções${contratoEm ? `. Essa relação está formalizada em contrato de dados assinado em ${data(contratoEm)}` : ""}, como pede o art. 39 da LGPD.`);

  md.push(`## Quais dados tratamos e por quê`);
  if (atividades.length) {
    md.push(`| Situação | Dados | Para quê | Base legal |
| --- | --- | --- | --- |
${atividades.map((a) => `| ${celula(situacaoDe(a))} | ${celula(vozDaEmpresa(a.categoriasDado))} | ${celula(vozDaEmpresa(a.finalidade))} | ${celula(vozDaEmpresa(a.baseLegal))} |`).join("\n")}`);
  } else {
    md.push(`Tratamos os dados que você nos envia ao entrar em contato (como nome, e-mail e telefone) para responder e atender o seu pedido, com base em procedimentos preliminares a um contrato (art. 7º, V, da LGPD).`);
  }

  if (fluxos.has("ads") || fluxos.has("capi") || fluxos.has("publicos")) {
    const itens: string[] = [];
    if (fluxos.has("ads"))
      itens.push(
        "**Pixel e tags de anúncio** (como o Pixel do Meta e a tag do Google) registram visitas e ações no site para medir campanhas e mostrar anúncios a quem já nos visitou. Eles só são ativados depois do seu consentimento no aviso de cookies, e você pode mudar essa escolha a qualquer momento no próprio aviso ou nas configurações do navegador.",
      );
    if (fluxos.has("capi"))
      itens.push(
        "**Envio de conversões pelo servidor** (API de Conversões do Meta e Conversões otimizadas do Google): quando você compra ou se cadastra, informamos esse evento às plataformas de anúncio. E-mail e telefone seguem criptografados (hash), sem que a plataforma receba o dado em texto aberto.",
      );
    if (fluxos.has("publicos"))
      itens.push(
        "**Públicos personalizados:** podemos enviar às plataformas de anúncio listas de clientes, criptografadas, para mostrar anúncios relevantes ou deixar de mostrá-los a quem já é cliente. Se não quiser fazer parte dessas listas, é só pedir pelo canal abaixo.",
      );
    md.push(`## Cookies e anúncios\n\n${itens.map((i) => `- ${i}`).join("\n")}`);
  }

  md.push(`## Com quem compartilhamos

**Não vendemos dados pessoais.** Compartilhamos dados somente:

- com a agência ${agencia.nome}, que opera campanhas, atendimento e automações em nosso nome;
- com as ferramentas listadas abaixo, cada uma com seus próprios termos de proteção de dados;
- com autoridades, quando houver obrigação legal ou ordem judicial.`);
  if (ferramentas.length) md.push(tabelaFerramentas(ferramentas));

  if (foraDoBrasil(ferramentas)) {
    md.push(`## Transferência internacional

Algumas dessas ferramentas guardam dados fora do Brasil. A transferência segue o art. 33 da LGPD, com cláusulas contratuais e garantias de proteção oferecidas pelos próprios fornecedores.`);
  }

  if (atividades.length) {
    md.push(`## Por quanto tempo guardamos

| Situação | Prazo |
| --- | --- |
${atividades.map((a) => `| ${celula(situacaoDe(a))} | ${celula(vozDaEmpresa(a.prazoRetencao))} |`).join("\n")}

Depois desses prazos, os dados são excluídos ou anonimizados, a não ser que a lei exija guardá-los por mais tempo.`);
  }

  md.push(`## Seus direitos

${DIREITOS}

Para fazer qualquer pedido, fale com a gente ${canalTitular}. Respondemos em até 15 dias. Você também pode reclamar à [Autoridade Nacional de Proteção de Dados (ANPD)](https://www.gov.br/anpd/pt-br).`);

  md.push(`## Segurança

- A agência que opera nossos dados assinou contrato de dados com regras de segurança, sigilo e aviso de incidentes${contratoEm ? "" : " (em formalização)"}.
- Usamos ferramentas reconhecidas, com criptografia e controle de acesso.
- Se acontecer um incidente de segurança que possa causar risco relevante, avisamos a ANPD e as pessoas afetadas, como manda o art. 48 da LGPD.${certificado ? `\n- Nossa documentação de privacidade é verificada pela Dattis: [conferir certificado](/verificar/${certificado.codigo}).` : ""}`);

  md.push(`## Mudanças nesta Política

Esta Política é atualizada sempre que mudamos a forma de tratar dados. Última atualização: ${data(atualizadaEm)}.`);

  return { tipo: "conta", titular: conta.nome, site: conta.site, markdown: md.join("\n\n"), atualizadaEm, certificado };
}

// ---------------------------------------------------------------------------------------------

export async function politicaDaAgencia(agenciaId: string): Promise<PoliticaPublica | null> {
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId) });
  if (!agencia) return null;
  const contas = await db.query.contasCliente.findMany({ where: eq(contasCliente.agenciaId, agenciaId) });
  const [ferramentas, certificado] = await Promise.all([
    ferramentasDe(contas.map((c) => c.id)),
    certificadoValido(and(eq(certificados.agenciaId, agenciaId), eq(certificados.revogado, false), isNull(certificados.contaClienteId))),
  ]);
  const servicos = [...new Set(contas.flatMap((c) => fluxosDaConta(c).map((f) => SITUACAO[f.key])))];
  const canalTitular = canal(agencia.emailPrivacidade ?? agencia.email, agencia.whatsapp);
  const atualizadaEm = agencia.politicaPublicadaEm ?? agencia.createdAt;

  const md: string[] = [];
  md.push(
    `Esta Política explica como a **${agencia.nome}**${agencia.cnpj ? `, CNPJ ${agencia.cnpj},` : ""}${agencia.endereco ? ` com sede em ${agencia.endereco},` : ""} trata dados pessoais. Somos uma agência de marketing e, por isso, tratamos dados em duas situações diferentes: na nossa própria operação e em nome das empresas que atendemos. Seguimos a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, "LGPD").`,
  );

  md.push(`## Na nossa própria operação (somos controladores)

| Situação | Dados | Para quê | Base legal |
| --- | --- | --- | --- |
| Visita ao nosso site | Endereço IP, navegador, páginas acessadas e, com seu consentimento, cookies de medição e anúncio | Funcionamento, segurança e medição do site | Legítimo interesse (art. 7º, IX) e consentimento para cookies não essenciais (art. 7º, I) |
| Pedido de orçamento ou contato | Nome, e-mail, telefone, empresa e mensagem | Responder e apresentar nossos serviços | Procedimentos preliminares a um contrato, a seu pedido (art. 7º, V) |
| Clientes da agência | Dados dos representantes, contratos e cobrança | Prestar o serviço contratado, emitir notas e cumprir obrigações | Execução de contrato e obrigação legal (art. 7º, V e II) |`);

  md.push(`## Em nome dos nossos clientes (somos operadores)

Para as empresas que atendemos, tratamos dados dos clientes e leads delas para executar ${servicos.length ? "serviços como:" : "campanhas, atendimento e automações."}${servicos.length ? `\n\n${servicos.map((s) => `- ${s}`).join("\n")}` : ""}

Nesses casos, quem decide sobre os dados é a empresa cliente, e nós seguimos as instruções dela. Formalizamos essa relação com contrato de dados (art. 39 da LGPD) e registro de cada atividade de tratamento.

Se você é cliente de uma empresa que atendemos, faça seu pedido sobre dados diretamente a ela. Se nos procurar, encaminhamos o pedido em até 2 dias úteis.`);

  if (ferramentas.length) {
    md.push(`## Ferramentas que usamos

Usamos as ferramentas abaixo nos serviços que prestamos, cada uma com seus próprios termos de proteção de dados. **Não vendemos dados pessoais.**

${tabelaFerramentas(ferramentas)}`);
  }
  if (foraDoBrasil(ferramentas)) {
    md.push(`## Transferência internacional

Algumas ferramentas guardam dados fora do Brasil. A transferência segue o art. 33 da LGPD, com cláusulas contratuais e garantias de proteção oferecidas pelos fornecedores.`);
  }

  md.push(`## Por quanto tempo guardamos

| Dados | Prazo |
| --- | --- |
| Contatos comerciais sem contrato | Até 24 meses sem nova interação, ou até você pedir a exclusão |
| Dados de clientes da agência e contratos | Durante o contrato e pelo prazo exigido pela legislação fiscal e para defesa em processos, em regra 5 anos |
| Dados tratados em nome dos clientes | Durante o contrato com cada cliente; ao final, são devolvidos ou excluídos conforme a instrução dele |`);

  md.push(`## Seus direitos

${DIREITOS}

Para fazer qualquer pedido, fale com a gente ${canalTitular}. Respondemos em até 15 dias. Você também pode reclamar à [Autoridade Nacional de Proteção de Dados (ANPD)](https://www.gov.br/anpd/pt-br).`);

  md.push(`## Segurança

- Acesso aos dados restrito à equipe que precisa deles, com contas individuais e senhas.
- Contrato de dados com cada cliente, com regras de sigilo, segurança e aviso de incidentes.
- Se acontecer um incidente de segurança que possa causar risco relevante, comunicamos a ANPD, os clientes envolvidos e as pessoas afetadas, como manda o art. 48 da LGPD.${certificado ? `\n- Nossa documentação de privacidade é verificada pela Dattis: [conferir certificado](/verificar/${certificado.codigo}).` : ""}`);

  md.push(`## Mudanças nesta Política

Esta Política é atualizada sempre que mudamos a forma de tratar dados. Última atualização: ${data(atualizadaEm)}.`);

  return { tipo: "agencia", titular: agencia.nome, site: null, markdown: md.join("\n\n"), atualizadaEm, certificado };
}

// ---------------------------------------------------------------------------------------------

/** Slug livre no espaço único /p/{slug} (agências e contas dividem o mesmo prefixo). */
export async function slugDisponivel(nome: string) {
  const base = slugify(nome).slice(0, 60) || "politica";
  for (let i = 1; i < 500; i++) {
    const s = i === 1 ? base : `${base}-${i}`;
    const [a, c] = await Promise.all([
      db.query.agencias.findFirst({ where: eq(agencias.slug, s), columns: { id: true } }),
      db.query.contasCliente.findFirst({ where: eq(contasCliente.slug, s), columns: { id: true } }),
    ]);
    if (!a && !c) return s;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

/** Resolve /p/{slug}: só devolve política publicada, de agência ativa em plano Growth/Scale. */
export async function politicaPorSlug(slug: string) {
  const ag = await db.query.agencias.findFirst({ where: eq(agencias.slug, slug) });
  if (ag) {
    if (!ag.politicaPublicadaEm || ag.suspensa || ag.plano === "start") return null;
    return politicaDaAgencia(ag.id);
  }
  const conta = await db.query.contasCliente.findFirst({ where: eq(contasCliente.slug, slug) });
  if (!conta?.politicaPublicadaEm) return null;
  const dona = await db.query.agencias.findFirst({ where: eq(agencias.id, conta.agenciaId), columns: { suspensa: true, plano: true } });
  if (!dona || dona.suspensa || dona.plano === "start") return null;
  return politicaDaConta(conta.id);
}
