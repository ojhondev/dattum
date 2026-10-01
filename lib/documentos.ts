// Gerador de documentos de privacidade a partir dos dados de cada conta.
// Modelos fixos e versionados (não IA): o texto é previsível, auditável e igual pra toda agência.
// Lacunas que a Dattis não conhece aparecem como [preencher: ...].
import { FLUXO_POR_CHAVE, type FlowKey } from "@/lib/fluxos";

export const VERSAO_MODELOS = "2026.10";

export type DadosDocumento = {
  agencia: { nome: string; cnpj: string | null; email: string };
  conta: {
    nome: string;
    cnpj: string | null;
    site: string | null;
    contatoNome: string | null;
    contatoEmail: string | null;
    fluxos: FlowKey[];
  };
  ferramentas: { nome: string; pais: string | null }[];
};

export type TipoDocumento = {
  id: string;
  titulo: string;
  resumo: string;
  ondeUsar: string;
};

export const TIPOS_DOCUMENTO: TipoDocumento[] = [
  {
    id: "clausula-contrato",
    titulo: "Cláusula de LGPD para o contrato",
    resumo: "Trecho pronto pra colar no contrato de prestação de serviços entre a agência e o cliente.",
    ondeUsar: "Contrato de prestação de serviços (nova cláusula ou aditivo)",
  },
  {
    id: "declaracao-lista",
    titulo: "Declaração de origem da lista de clientes",
    resumo: "O cliente declara que a base enviada pra criar público foi coletada de forma lícita. Protege a agência.",
    ondeUsar: "Antes de subir qualquer lista no Gerenciador de Anúncios ou no Google Ads",
  },
  {
    id: "politica-privacidade",
    titulo: "Política de privacidade do site",
    resumo: "Política completa pro site do cliente, com o que ele realmente faz: pixel, formulários, WhatsApp e CRM.",
    ondeUsar: "Página /privacidade do site, link no rodapé e nos formulários",
  },
  {
    id: "aviso-formulario",
    titulo: "Aviso para formulário de lead",
    resumo: "Texto curto pra colocar logo abaixo do botão de envio do formulário ou no Formulário instantâneo do Meta.",
    ondeUsar: "Landing pages e Formulário instantâneo (campo de política de privacidade)",
  },
  {
    id: "banner-cookies",
    titulo: "Texto do banner de cookies",
    resumo: "Textos do banner e das categorias de cookies, prontos pro Cookiebot, CookieYes ou banner próprio.",
    ondeUsar: "Ferramenta de consentimento de cookies do site",
  },
  {
    id: "optin-whatsapp",
    titulo: "Mensagem de autorização no WhatsApp",
    resumo: "Primeira mensagem do atendimento pedindo autorização pra contato e envio de ofertas.",
    ondeUsar: "Mensagem de boas-vindas do WhatsApp / anúncio de clique pro WhatsApp",
  },
];

const P = (campo: string) => `[preencher: ${campo}]`;
const tem = (d: DadosDocumento, f: FlowKey) => d.conta.fluxos.includes(f);
const hoje = () => new Date().toLocaleDateString("pt-BR");
const cnpj = (v: string | null) => (v ? `inscrita no CNPJ sob o nº ${v}` : `inscrita no CNPJ sob o nº ${P("CNPJ")}`);
const lista = (itens: string[]) => itens.map((i) => `- ${i}`).join("\n");
const ferramentasTexto = (d: DadosDocumento) =>
  d.ferramentas.length ? lista(d.ferramentas.map((f) => `${f.nome}${f.pais ? ` (${f.pais})` : ""}`)) : `- ${P("ferramentas utilizadas")}`;
const internacional = (d: DadosDocumento) => d.ferramentas.some((f) => f.pais && f.pais !== "Brasil");

function clausulaContrato(d: DadosDocumento) {
  const operacoes = d.conta.fluxos.map((f) => FLUXO_POR_CHAVE[f].titulo.toLowerCase());
  return `CLÁUSULA ${P("nº")} — PROTEÇÃO DE DADOS PESSOAIS

${P("nº")}.1. As partes se comprometem a cumprir a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD). Para os fins deste contrato, a CONTRATANTE, ${d.conta.nome}, ${cnpj(d.conta.cnpj)}, atua como CONTROLADORA, e a CONTRATADA, ${d.agencia.nome}, ${cnpj(d.agencia.cnpj)}, atua como OPERADORA dos dados pessoais tratados na execução dos serviços.

${P("nº")}.2. A OPERADORA tratará dados pessoais exclusivamente para executar os serviços de marketing e tráfego pago contratados${operacoes.length ? `, incluindo: ${operacoes.join("; ")}` : ""}, e somente conforme as instruções documentadas da CONTROLADORA (art. 39 da LGPD).

${P("nº")}.3. Compete à CONTROLADORA garantir que os dados pessoais fornecidos à OPERADORA — inclusive listas de clientes e leads — foram coletados de forma lícita, com base legal adequada e com a devida transparência aos titulares.

${P("nº")}.4. A OPERADORA poderá utilizar as seguintes ferramentas de terceiros (suboperadores) no tratamento dos dados, ficando vedada a inclusão de novas ferramentas sem ciência prévia da CONTROLADORA:
${ferramentasTexto(d)}
${internacional(d) ? `\n${P("nº")}.4.1. A CONTROLADORA está ciente de que parte dessas ferramentas armazena dados fora do Brasil, em conformidade com o art. 33 da LGPD.\n` : ""}
${P("nº")}.5. A OPERADORA adotará medidas de segurança técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas (art. 46 da LGPD), incluindo controle de acesso às contas de anúncio, Business Manager, CRMs e planilhas, com revogação imediata de acessos de colaboradores desligados.

${P("nº")}.6. A OPERADORA comunicará à CONTROLADORA, em até ${P("48 horas")} após tomar conhecimento, qualquer incidente de segurança que possa acarretar risco ou dano relevante aos titulares, e prestará o apoio necessário para a comunicação à ANPD e aos titulares, quando cabível.

${P("nº")}.7. A OPERADORA auxiliará a CONTROLADORA no atendimento às solicitações dos titulares (art. 18 da LGPD) que forem direcionadas a ela, encaminhando-as em até ${P("5 dias úteis")}.

${P("nº")}.8. Encerrado o contrato, a OPERADORA eliminará ou devolverá os dados pessoais da CONTROLADORA em até ${P("30 dias")}, incluindo públicos personalizados criados nas plataformas de anúncio, salvo obrigação legal de guarda.

${P("nº")}.9. Cada parte responderá pelos danos que causar por descumprimento da LGPD, nos termos dos arts. 42 a 45 da Lei, observado que a OPERADORA responde solidariamente apenas quando descumprir a legislação ou as instruções lícitas da CONTROLADORA.

${P("nº")}.10. O Registro das Atividades de Tratamento e o Contrato de Operação de Dados (DPA) mantidos na plataforma Dattis integram este contrato como anexos.`;
}

function declaracaoLista(d: DadosDocumento) {
  return `DECLARAÇÃO DE ORIGEM E BASE LEGAL DE LISTA DE CLIENTES

${d.conta.nome}, ${cnpj(d.conta.cnpj)}, neste ato representada por ${d.conta.contatoNome ?? P("nome do responsável")}, declara, para fins de uso pela agência ${d.agencia.nome} na criação de públicos em plataformas de anúncio (como Público personalizado do Meta e Correspondência de clientes do Google), que:

1. A lista de contatos entregue à agência em ${P("data do envio")}, com aproximadamente ${P("quantidade")} registros, foi coletada diretamente pela empresa junto aos titulares, por meio de ${P("origem: compras, cadastro no site, atendimento etc.")}.

2. Os titulares foram informados de que seus dados poderiam ser usados para comunicação de marketing e publicidade, e a empresa possui base legal para esse uso (consentimento ou legítimo interesse, nos termos do art. 7º da Lei nº 13.709/2018).

3. A lista não contém dados comprados de terceiros, dados de menores de idade nem dados pessoais sensíveis (saúde, religião, origem racial, orientação sexual, entre outros).

4. Titulares que pediram para não receber comunicações foram retirados da lista.

5. A empresa autoriza a agência a enviar a lista às plataformas de anúncio em formato criptografado (hash), exclusivamente para as campanhas contratadas, e a excluir os públicos criados ao fim do contrato.

${P("Cidade")}, ${hoje()}.

______________________________________
${d.conta.contatoNome ?? P("nome do responsável")} — ${d.conta.nome}`;
}

function politicaPrivacidade(d: DadosDocumento) {
  const secoes: string[] = [];
  const coleta: string[] = [];
  if (tem(d, "formularios")) coleta.push("Dados que você informa em formulários: nome, e-mail, telefone e respostas às perguntas do formulário.");
  if (tem(d, "whatsapp")) coleta.push("Dados de conversas pelo WhatsApp: nome, telefone e o conteúdo da conversa.");
  if (tem(d, "ads") || tem(d, "capi")) coleta.push("Dados de navegação coletados por cookies e pixels: páginas visitadas, dispositivo, identificadores de navegador e ações realizadas no site.");
  if (tem(d, "capi")) coleta.push("Dados de compra ou cadastro (como e-mail e telefone criptografados) enviados às plataformas de anúncio para medir o resultado das campanhas.");
  if (!coleta.length) coleta.push(P("quais dados o site coleta"));

  secoes.push(`# Política de Privacidade — ${d.conta.nome}

Última atualização: ${hoje()}

Esta política explica como ${d.conta.nome}, ${cnpj(d.conta.cnpj)}, coleta, usa e protege os seus dados pessoais quando você acessa ${d.conta.site ?? P("endereço do site")}, preenche nossos formulários ou fala com a gente, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`);

  secoes.push(`## 1. Quais dados coletamos

${lista(coleta)}`);

  const finalidades = ["Responder seus contatos e enviar as informações que você pediu."];
  if (tem(d, "ads") || tem(d, "capi") || tem(d, "publicos")) finalidades.push("Exibir anúncios mais relevantes e medir o resultado das nossas campanhas.");
  if (tem(d, "crm")) finalidades.push("Organizar o atendimento comercial e acompanhar o andamento do seu pedido.");
  if (tem(d, "publicos")) finalidades.push("Criar públicos nas plataformas de anúncio a partir da nossa base de clientes, com dados criptografados.");
  finalidades.push("Cumprir obrigações legais e regulatórias.");
  secoes.push(`## 2. Para que usamos seus dados

${lista(finalidades)}`);

  secoes.push(`## 3. Bases legais

Tratamos seus dados com base no seu consentimento (por exemplo, ao aceitar cookies de marketing), na execução de contrato ou de procedimentos preliminares a pedido seu, no cumprimento de obrigação legal e no nosso legítimo interesse, sempre respeitando seus direitos (art. 7º da LGPD).`);

  if (tem(d, "ads") || tem(d, "capi")) {
    secoes.push(`## 4. Cookies e pixels

Usamos cookies necessários para o funcionamento do site e, somente com a sua autorização, cookies e pixels de marketing e medição (como Pixel do Meta e tag do Google). Você pode aceitar, recusar ou mudar sua escolha a qualquer momento no banner de cookies.`);
  }

  secoes.push(`## ${tem(d, "ads") || tem(d, "capi") ? 5 : 4}. Com quem compartilhamos

Compartilhamos dados apenas com fornecedores que nos ajudam a operar o site, o atendimento e as campanhas, que também devem proteger seus dados:

${ferramentasTexto(d)}

Contamos com o apoio da agência ${d.agencia.nome} na gestão das campanhas, que atua como operadora e segue nossas instruções.${internacional(d) ? " Alguns desses fornecedores armazenam dados fora do Brasil, com as garantias previstas no art. 33 da LGPD." : ""}`);

  const n = tem(d, "ads") || tem(d, "capi") ? 6 : 5;
  secoes.push(`## ${n}. Por quanto tempo guardamos

Guardamos seus dados pelo tempo necessário para as finalidades acima: dados de contato e atendimento por até ${P("12 meses")} sem interação, dados de compra pelo prazo exigido em lei e dados de navegação por até 13 meses. Depois disso, eles são eliminados ou anonimizados.`);

  secoes.push(`## ${n + 1}. Seus direitos

Você pode, a qualquer momento: confirmar se tratamos seus dados, acessá-los, corrigi-los, pedir a eliminação, a portabilidade, informações sobre compartilhamento e revogar seu consentimento (art. 18 da LGPD). Para isso, fale com a gente em ${d.conta.contatoEmail ?? P("e-mail de contato para privacidade")}.`);

  secoes.push(`## ${n + 2}. Segurança

Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, perda ou vazamento, como conexão criptografada (HTTPS) e controle de acesso às nossas ferramentas.`);

  secoes.push(`## ${n + 3}. Contato do encarregado

Encarregado pelo tratamento de dados: ${P("nome do encarregado ou canal de atendimento")} — ${d.conta.contatoEmail ?? P("e-mail")}.`);

  return secoes.join("\n\n");
}

function avisoFormulario(d: DadosDocumento) {
  return `Versão curta (abaixo do botão de envio):
Ao enviar, você concorda que ${d.conta.nome} use seus dados para entrar em contato sobre sua solicitação${tem(d, "crm") ? " e enviar conteúdos relacionados" : ""}. Saiba mais na nossa Política de Privacidade: ${d.conta.site ? `${d.conta.site.replace(/\/$/, "")}/privacidade` : P("link da política")}.

Versão com caixa de seleção (recomendada para receber ofertas):
[ ] Quero receber ofertas e novidades de ${d.conta.nome} por e-mail e WhatsApp. Posso cancelar quando quiser.

Formulário instantâneo do Meta (campo "Política de privacidade"):
Nome do link: Política de Privacidade — ${d.conta.nome}
URL: ${d.conta.site ? `${d.conta.site.replace(/\/$/, "")}/privacidade` : P("link da política")}
Aviso personalizado: Usaremos seus dados apenas para responder ao seu pedido${tem(d, "whatsapp") ? ", inclusive pelo WhatsApp" : ""}. Você pode pedir a exclusão a qualquer momento.`;
}

function bannerCookies(d: DadosDocumento) {
  return `Título do banner:
Sua privacidade importa pra gente

Texto do banner:
${d.conta.nome} usa cookies necessários para o site funcionar e, com a sua autorização, cookies de medição e de marketing para entender como você navega e mostrar anúncios mais relevantes. Você escolhe.

Botões:
[Aceitar todos]   [Recusar]   [Personalizar]

Categorias (tela "Personalizar"):
- Necessários (sempre ativos): garantem o funcionamento básico do site, como segurança e carrinho.
- Medição: ajudam a entender quais páginas são mais acessadas (ex.: Google Analytics).
- Marketing: permitem mostrar anúncios relevantes em outras plataformas (ex.: Pixel do Meta, tag do Google Ads${tem(d, "ads") ? ", Pixel do TikTok" : ""}).

Link: Política de Privacidade — ${d.conta.site ? `${d.conta.site.replace(/\/$/, "")}/privacidade` : P("link da política")}

Configuração obrigatória: os pixels e tags de Medição e Marketing só podem disparar DEPOIS do clique em "Aceitar". O botão "Recusar" precisa ter o mesmo destaque do "Aceitar".`;
}

function optinWhatsapp(d: DadosDocumento) {
  return `Mensagem de boas-vindas:
Olá! Aqui é da ${d.conta.nome} 👋 Recebemos seu contato e vamos te atender por aqui.
Usamos seu nome e telefone só para responder ao seu pedido, conforme nossa Política de Privacidade: ${d.conta.site ? `${d.conta.site.replace(/\/$/, "")}/privacidade` : P("link da política")}.

Pedido de autorização para ofertas (enviar depois do atendimento):
Posso te mandar novidades e ofertas da ${d.conta.nome} por aqui? Responda SIM para receber ou NÃO se preferir não receber. Você pode cancelar a qualquer momento enviando SAIR.

Resposta ao SAIR:
Pronto, você não vai mais receber nossas ofertas. Se precisar de algo, é só chamar.

Regra da agência: só incluir em listas de disparo quem respondeu SIM, e registrar a data da autorização no CRM${d.ferramentas.find((f) => /crm|rd station|hubspot|kommo|pipedrive/i.test(f.nome)) ? ` (${d.ferramentas.find((f) => /crm|rd station|hubspot|kommo|pipedrive/i.test(f.nome))!.nome})` : ""}.`;
}

export function gerarDocumento(tipo: string, d: DadosDocumento) {
  switch (tipo) {
    case "clausula-contrato":
      return clausulaContrato(d);
    case "declaracao-lista":
      return declaracaoLista(d);
    case "politica-privacidade":
      return politicaPrivacidade(d);
    case "aviso-formulario":
      return avisoFormulario(d);
    case "banner-cookies":
      return bannerCookies(d);
    case "optin-whatsapp":
      return optinWhatsapp(d);
    default:
      return "";
  }
}

export const contarLacunas = (texto: string) => (texto.match(/\[preencher:/g) || []).length;
