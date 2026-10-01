import type { FlowKey } from "@/lib/fluxos";

export type { FlowKey };

export type FlowTemplate = {
  nomeAtividade: string;
  categoriasDado: string;
  finalidade: string;
  baseLegal: string;
  titulares: string;
  prazoRetencao: string;
  subprocessadorChaves: string[]; // chaves em subprocessadores_catalogo
};

// Uma atividade de RAT por fluxo marcado na ativação da conta. Nome em linguagem de gestor; termo técnico entre parênteses.
export const FLOW_TEMPLATES: Record<FlowKey, FlowTemplate> = {
  publicos: {
    nomeAtividade: "Envio de lista de clientes pra criar público nos anúncios (Público personalizado / Customer Match)",
    categoriasDado: "Nome, e-mail e telefone de clientes e leads, enviados criptografados (hash) às plataformas de anúncio",
    finalidade: "Criar públicos de remarketing, públicos semelhantes e listas de exclusão nas campanhas do cliente",
    baseLegal: "Consentimento do titular ou legítimo interesse do controlador, com teste de balanceamento (art. 7º, I e IX, LGPD)",
    titulares: "Clientes e leads da base do cliente final",
    prazoRetencao: "Enquanto o público estiver em uso nas campanhas, removido em até 30 dias após o fim do contrato",
    subprocessadorChaves: ["meta-ads", "google-ads"],
  },
  capi: {
    nomeAtividade: "Envio de vendas e leads do site/CRM pras plataformas (API de Conversões do Meta / Conversões otimizadas do Google)",
    categoriasDado:
      "E-mail e telefone criptografados (hash), identificador de navegador, evento de conversão (compra, cadastro, checkout) e valor",
    finalidade: "Mensurar o resultado das campanhas e otimizar a entrega dos anúncios do cliente",
    baseLegal: "Legítimo interesse do controlador (cliente) e execução do contrato entre agência e cliente (art. 7º, IX e V, LGPD)",
    titulares: "Compradores e leads do cliente final",
    prazoRetencao: "Enquanto durar a campanha ativa, mais 6 meses, ou conforme instrução do cliente",
    subprocessadorChaves: ["meta-ads", "google-ads"],
  },
  ads: {
    nomeAtividade: "Pixel e tags de anúncio no site do cliente (Pixel do Meta, tag do Google, Pixel do TikTok)",
    categoriasDado: "Cookies e identificadores de navegador, páginas visitadas, eventos de conversão",
    finalidade: "Medir visitas e conversões e criar públicos de remarketing de quem visitou o site",
    baseLegal: "Consentimento do visitante via banner de cookies (art. 7º, I, e art. 8º, LGPD)",
    titulares: "Visitantes do site e das landing pages do cliente",
    prazoRetencao: "Conforme a política de cookies do site, no máximo 13 meses",
    subprocessadorChaves: ["meta-ads", "google-ads"],
  },
  formularios: {
    nomeAtividade: "Captação de lead por formulário (Formulário instantâneo do Meta, formulário do Google, landing page)",
    categoriasDado: "Nome, e-mail, telefone, cidade e respostas de qualificação informadas pelo lead",
    finalidade: "Gerar e entregar leads qualificados ao time comercial do cliente",
    baseLegal: "Consentimento do titular no envio do formulário, com aviso de finalidade e link da política (art. 7º, I, e art. 9º, LGPD)",
    titulares: "Pessoas que preenchem os formulários das campanhas do cliente",
    prazoRetencao: "Até 12 meses sem interação, ou até o titular pedir exclusão",
    subprocessadorChaves: ["meta-ads"],
  },
  whatsapp: {
    nomeAtividade: "Atendimento e qualificação de lead pelo WhatsApp (anúncio de clique pro WhatsApp e atendimento)",
    categoriasDado: "Nome, telefone, conteúdo da conversa, histórico de interesse comercial",
    finalidade: "Atender, qualificar e dar andamento comercial a leads gerados pelas campanhas",
    baseLegal: "Procedimento preliminar de contrato a pedido do titular (art. 7º, V, LGPD)",
    titulares: "Leads que iniciam contato pelo WhatsApp com o cliente",
    prazoRetencao: "Duração do relacionamento comercial, mais 12 meses",
    subprocessadorChaves: ["whatsapp-business"],
  },
  crm: {
    nomeAtividade: "Armazenamento de lead em CRM, planilha ou automação",
    categoriasDado: "Nome, e-mail, telefone, origem do lead, histórico de funil",
    finalidade: "Organizar, nutrir e acompanhar o funil comercial dos leads do cliente",
    baseLegal: "Execução de contrato entre agência e cliente (art. 7º, V, LGPD)",
    titulares: "Leads e clientes do cliente final atendido pela agência",
    prazoRetencao: "Duração do relacionamento comercial, mais 12 meses",
    subprocessadorChaves: [], // CRM é informado pela agência na ativação (padrão: RD Station)
  },
};

export function gerarConteudoDpa(params: {
  agenciaNome: string;
  agenciaCnpj?: string | null;
  contaNome: string;
  contaCnpj: string | null;
  subprocessadores: string[];
}) {
  const { agenciaNome, agenciaCnpj, contaNome, contaCnpj, subprocessadores } = params;
  const listaSub =
    subprocessadores.length > 0
      ? subprocessadores.map((s) => `  - ${s}`).join("\n")
      : "  - Nenhum subprocessador vinculado no momento da geração.";

  return `CONTRATO DE OPERAÇÃO DE DADOS PESSOAIS (DPA)

Este instrumento, firmado nos termos da Lei nº 13.709/2018 (LGPD), formaliza a relação
entre:

OPERADORA: ${agenciaNome}${agenciaCnpj ? ` (CNPJ ${agenciaCnpj})` : ""}, doravante "Agência".
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
Atividades de Tratamento desta conta. As assinaturas eletrônicas da Agência e do Cliente
(nome, cargo, e-mail, data/hora, IP e navegador de cada responsável, além do resumo
SHA-256 deste texto) valem como aceite entre as partes nos termos do art. 10, §2º, da
Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020.`;
}
