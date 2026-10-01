// Como o dado circula numa operação de tráfego pago — em português de gestor de tráfego, não em jargão de plataforma.
// O nome técnico (CAPI, Custom Audiences, Enhanced Conversions...) aparece só como referência, em "comoChamam".

export type FlowKey = "publicos" | "capi" | "ads" | "formularios" | "whatsapp" | "crm";

export type Fluxo = {
  key: FlowKey;
  titulo: string; // o que a agência faz, dito como ela diz
  curto: string; // rótulo de chip
  comoChamam: string; // nomes que aparecem no Gerenciador de Anúncios / Google Ads
  exemplos: string[];
  risco: string; // por que isso é urgente
  artigo: string;
};

export const FLUXOS: Fluxo[] = [
  {
    key: "publicos",
    titulo: "Sobe lista de clientes pra criar público",
    curto: "Lista de clientes",
    comoChamam: "No Meta: Público personalizado e Público semelhante (lookalike). No Google: Correspondência de clientes (Customer Match).",
    exemplos: [
      "Planilha de compradores pra remarketing",
      "Base de leads pra criar público semelhante",
      "Lista pra excluir quem já comprou da campanha",
    ],
    risco:
      "Cada planilha enviada é nome, e-mail e telefone saindo do país. Sem autorização do titular e sem contrato com o cliente, quem responde é a agência — junto com ele.",
    artigo: "Art. 7º e 33",
  },
  {
    key: "capi",
    titulo: "Manda vendas e leads do site ou CRM pro Meta e Google",
    curto: "API de Conversões",
    comoChamam:
      "No Meta: API de Conversões (CAPI) — via Shopify, Nuvemshop, GTM server-side ou Stape. No Google: Conversões otimizadas (Enhanced Conversions) e conversão offline. No TikTok: Events API.",
    exemplos: [
      "Rastreamento de compra pelo servidor",
      "E-mail e telefone do comprador enviados pra melhorar a atribuição",
      "Venda fechada no CRM devolvida como conversão",
    ],
    risco:
      "É dado pessoal saindo do servidor, invisível pro visitante. Se não for criptografado (hash) e não estiver no contrato, é tratamento sem controle nenhum.",
    artigo: "Art. 46",
  },
  {
    key: "ads",
    titulo: "Instala pixel e tags no site do cliente",
    curto: "Pixel e tags",
    comoChamam: "Pixel do Meta, tag do Google (GA4 e Google Ads, normalmente pelo Tag Manager), Pixel do TikTok, remarketing de visitantes.",
    exemplos: ["Pixel na loja ou na landing page", "Tag Manager com as conversões", "Público de quem visitou o site"],
    risco:
      "Pixel que dispara antes do aceite de cookies é a falha mais encontrada em fiscalização — e quem instalou o pixel foi a agência.",
    artigo: "Art. 8º e 42",
  },
  {
    key: "formularios",
    titulo: "Capta lead por formulário",
    curto: "Formulário de lead",
    comoChamam:
      "No Meta: Formulário instantâneo (campanha de cadastro / Lead Ads). No Google: formulário de lead. Landing pages (RD, Elementor, Typeform, Hotmart).",
    exemplos: ["Campanha de cadastro com formulário nativo", "Landing page de captura", "Isca digital (e-book, aula, cupom)"],
    risco:
      "O formulário precisa dizer pra que o dado vai ser usado e linkar a política de privacidade. Sem isso, o lead não autorizou nada.",
    artigo: "Art. 9º",
  },
  {
    key: "whatsapp",
    titulo: "Atende lead pelo WhatsApp",
    curto: "WhatsApp",
    comoChamam: "Anúncio de clique pro WhatsApp, WhatsApp Business, API oficial e plataformas de atendimento e disparo.",
    exemplos: ["Anúncio que abre conversa no WhatsApp", "SDR da agência qualificando lead", "Disparo em massa pra base"],
    risco:
      "A conversa guarda nome, telefone e o que a pessoa quer comprar. Disparo pra quem não pediu é campeão de reclamação e derruba o número.",
    artigo: "Art. 7º e 18",
  },
  {
    key: "crm",
    titulo: "Guarda lead em CRM, planilha ou automação",
    curto: "CRM e planilha",
    comoChamam: "CRM (RD Station, HubSpot, Kommo, Pipedrive), planilha do Google, automação (Zapier, Make, n8n).",
    exemplos: ["Lead do formulário caindo numa planilha", "Integração do anúncio com o CRM", "Nutrição por e-mail"],
    risco:
      "Planilha compartilhada por link e acesso de ex-funcionário são as causas mais comuns de vazamento em agência.",
    artigo: "Art. 46 e 47",
  },
];

export const FLUXO_POR_CHAVE = Object.fromEntries(FLUXOS.map((f) => [f.key, f])) as Record<FlowKey, Fluxo>;

type ContaComFluxos = {
  flowPublicos: boolean;
  flowCapi: boolean;
  flowAds: boolean;
  flowFormularios: boolean;
  flowWhatsapp: boolean;
  flowCrm: boolean;
};

export function fluxosDaConta(c: ContaComFluxos): Fluxo[] {
  const ativo: Record<FlowKey, boolean> = {
    publicos: c.flowPublicos,
    capi: c.flowCapi,
    ads: c.flowAds,
    formularios: c.flowFormularios,
    whatsapp: c.flowWhatsapp,
    crm: c.flowCrm,
  };
  return FLUXOS.filter((f) => ativo[f.key]);
}
