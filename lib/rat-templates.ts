export type FlowKey = "capi" | "ads" | "whatsapp" | "crm";

export type FlowTemplate = {
  nomeAtividade: string;
  categoriasDado: string;
  finalidade: string;
  baseLegal: string;
  titulares: string;
  prazoRetencao: string;
  subprocessadorChave: string | null; // chave em subprocessadores_catalogo
};

export const FLOW_TEMPLATES: Record<FlowKey, FlowTemplate> = {
  capi: {
    nomeAtividade: "Conversion API (CAPI) e Custom Audiences",
    categoriasDado:
      "Dado de contato hasheado (e-mail, telefone), identificador de dispositivo, evento de conversão (compra, cadastro, checkout)",
    finalidade:
      "Otimizar e mensurar campanhas de tráfego pago via Meta Ads em nome do cliente",
    baseLegal:
      "Legítimo interesse do controlador (cliente) e execução do contrato entre agência e cliente (art. 7º, IX e V, LGPD)",
    titulares: "Leads e clientes do cliente final atendido pela agência",
    prazoRetencao: "Enquanto durar a campanha ativa, mais 6 meses, ou conforme instrução do cliente",
    subprocessadorChave: "meta-ads",
  },
  ads: {
    nomeAtividade: "Veiculação e mensuração de anúncios (Google/TikTok Ads)",
    categoriasDado:
      "Identificador de dispositivo/cookie, dado de audiência e conversão vinculado à campanha",
    finalidade: "Veicular, segmentar e mensurar campanhas de mídia paga em nome do cliente",
    baseLegal: "Legítimo interesse do controlador e execução do contrato (art. 7º, IX e V, LGPD)",
    titulares: "Visitantes do site e leads impactados pelas campanhas do cliente",
    prazoRetencao: "Enquanto durar a campanha ativa, mais 6 meses",
    subprocessadorChave: "google-ads",
  },
  whatsapp: {
    nomeAtividade: "Atendimento e qualificação de lead via WhatsApp",
    categoriasDado: "Nome, telefone, conteúdo da conversa, histórico de interesse comercial",
    finalidade: "Atender, qualificar e dar andamento comercial a leads gerados pelas campanhas",
    baseLegal:
      "Execução de contrato/procedimento preliminar a pedido do titular (art. 7º, V, LGPD)",
    titulares: "Leads que iniciam contato via WhatsApp com o cliente",
    prazoRetencao: "Duração do relacionamento comercial, mais 12 meses",
    subprocessadorChave: "whatsapp-business",
  },
  crm: {
    nomeAtividade: "Armazenamento e automação de lead em CRM",
    categoriasDado: "Nome, e-mail, telefone, origem do lead, histórico de funil",
    finalidade: "Organizar, nutrir e acompanhar o funil comercial dos leads do cliente",
    baseLegal: "Execução de contrato entre agência e cliente (art. 7º, V, LGPD)",
    titulares: "Leads e clientes do cliente final atendido pela agência",
    prazoRetencao: "Duração do relacionamento comercial, mais 12 meses",
    subprocessadorChave: "rd-station",
  },
};

export function gerarConteudoDpa(params: {
  agenciaNome: string;
  contaNome: string;
  contaCnpj: string | null;
  subprocessadores: string[];
}) {
  const { agenciaNome, contaNome, contaCnpj, subprocessadores } = params;
  const listaSub =
    subprocessadores.length > 0
      ? subprocessadores.map((s) => `  - ${s}`).join("\n")
      : "  - Nenhum subprocessador vinculado no momento da geração.";

  return `CONTRATO DE OPERAÇÃO DE DADOS PESSOAIS (DPA)

Este instrumento, firmado nos termos da Lei nº 13.709/2018 (LGPD), formaliza a relação
entre:

OPERADORA: ${agenciaNome}, doravante "Agência".
CONTROLADORA: ${contaNome}${contaCnpj ? ` (CNPJ ${contaCnpj})` : ""}, doravante "Cliente".

1. OBJETO
A Agência tratará dados pessoais em nome do Cliente exclusivamente para a execução dos
serviços de tráfego pago, atendimento e automação de marketing contratados, conforme
descrito no Registro de Atividades de Tratamento (RAT) mantido para esta conta.

2. OBRIGAÇÕES DA AGÊNCIA (OPERADORA)
2.1. Tratar os dados pessoais somente conforme as instruções documentadas do Cliente,
inclusive no que se refere à transferência dos dados a subprocessadores (art. 39, LGPD).
2.2. Adotar medidas de segurança técnicas e administrativas aptas a proteger os dados
pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição,
perda, alteração, comunicação ou difusão (art. 46, LGPD).
2.3. Notificar o Cliente em prazo razoável caso identifique incidente de segurança que
possa acarretar risco ou dano relevante aos titulares.
2.4. Auxiliar o Cliente no atendimento a solicitações de titulares de dados (art. 18,
LGPD), quando o pedido for direcionado à Agência.

3. SUBPROCESSADORES AUTORIZADOS
A Agência está autorizada a utilizar as seguintes ferramentas terceiras no tratamento
dos dados desta conta, sujeitas aos respectivos termos de proteção de dados de cada
fornecedor:
${listaSub}

4. VIGÊNCIA
Este contrato vigora enquanto durar a prestação de serviços entre as partes, sendo
automaticamente encerrado, para fins de tratamento de dados, no término do contrato
comercial correspondente.

5. FORO
Fica eleito o foro do domicílio do Cliente para dirimir eventuais controvérsias
decorrentes deste instrumento.

Documento gerado automaticamente pela plataforma Dattis a partir do Registro de
Atividades de Tratamento desta conta. A assinatura eletrônica abaixo (nome, cargo,
data/hora e IP do responsável) tem validade de aceite entre as partes nos termos do
art. 10, §2º, da Medida Provisória nº 2.200-2/2001.`;
}
