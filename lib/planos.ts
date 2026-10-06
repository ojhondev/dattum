export type PlanoId = "start" | "growth" | "scale";

export type Plano = {
  id: PlanoId;
  nome: string;
  preco: number; // R$ por cliente da agência/mês
  resumo: string;
  destaque?: boolean;
};

// Proposta de valor: a Dattis é o DPO da agência. No Start a agência usa a plataforma e faz tudo;
// no Growth a Dattis faz por ela (DPO operando a LGPD de cada cliente); no Scale, além disso,
// a Dattis é nomeada encarregada oficial da agência (ANPD, incidentes, gestor dedicado).
export const PLANOS: Plano[] = [
  { id: "start", nome: "Start", preco: 47, resumo: "Você mesmo faz: a plataforma organiza a LGPD e a agência opera sozinha." },
  { id: "growth", nome: "Growth", preco: 97, resumo: "A Dattis é o DPO da sua agência e faz o trabalho de LGPD por você.", destaque: true },
  { id: "scale", nome: "Scale", preco: 297, resumo: "Tudo do Growth, com a Dattis como encarregada oficial da agência perante a ANPD." },
];

/** Recursos por pilar. `true` = incluso, `false` = não incluso, string = incluso com detalhe. */
export type Recurso = { pilar: string; nome: string; valores: Record<PlanoId, boolean | string> };

export const RECURSOS: Recurso[] = [
  { pilar: "Quem faz", nome: "A Dattis como DPO, operando a LGPD de cada cliente", valores: { start: false, growth: true, scale: true } },
  { pilar: "Quem faz", nome: "Pedidos de titulares", valores: { start: "Você responde, com resposta pronta", growth: "Respondidos pelo DPO", scale: "Respondidos pelo DPO" } },
  { pilar: "Quem faz", nome: "Encarregado (DPO) oficial da agência, com contato público", valores: { start: false, growth: false, scale: true } },
  { pilar: "Quem faz", nome: "Resposta à ANPD e condução de incidentes", valores: { start: false, growth: false, scale: true } },
  { pilar: "Documentação", nome: "Registro do uso de dados de cada cliente (RAT)", valores: { start: true, growth: true, scale: true } },
  { pilar: "Documentação", nome: "Contrato de dados com o cliente (DPA)", valores: { start: "Modelo pronto", growth: "Com assinatura eletrônica", scale: "Com assinatura eletrônica" } },
  { pilar: "Documentação", nome: "Lista das ferramentas que usam os dados", valores: { start: true, growth: true, scale: true } },
  { pilar: "Proteção", nome: "Certificado e selo com QR Code", valores: { start: false, growth: "Agência e clientes", scale: "Agência e clientes" } },
  { pilar: "Proteção", nome: "Dossiê para BM suspensa", valores: { start: false, growth: true, scale: true } },
  { pilar: "Proteção", nome: "Vigilância diária de segurança", valores: { start: "Só documentação", growth: "Sites e documentação, com o DPO nos alertas", scale: "Sites e documentação, com o DPO nos alertas" } },
  { pilar: "Relacionamento", nome: "Relatório para o cliente", valores: { start: false, growth: true, scale: true } },
  { pilar: "Relacionamento", nome: "Auditoria da sua agência", valores: { start: true, growth: true, scale: true } },
  { pilar: "Relacionamento", nome: "Suporte", valores: { start: "E-mail", growth: "Prioritário", scale: "Gestor dedicado" } },
];

/**
 * Recursos que o Start não tem (ver RECURSOS acima). A mesma regra vale na tela e no servidor:
 * a tela usa para mostrar o convite ao Growth, a API para recusar (403) quem chama direto.
 */
export type RecursoPago = "certificado" | "dossie" | "relatorio" | "assinaturaEletronicaCliente";
const PLANOS_COM: Record<RecursoPago, PlanoId[]> = {
  certificado: ["growth", "scale"],
  dossie: ["growth", "scale"],
  relatorio: ["growth", "scale"],
  assinaturaEletronicaCliente: ["growth", "scale"],
};
export const planoPermite = (plano: string | null | undefined, recurso: RecursoPago) => (PLANOS_COM[recurso] as string[]).includes(plano ?? "");

export function destaquesDoPlano(id: PlanoId): string[] {
  return RECURSOS.filter((r) => r.valores[id] !== false).map((r) =>
    typeof r.valores[id] === "string" ? `${r.nome}: ${minusculaInicial(r.valores[id] as string)}` : r.nome,
  );
}

export const brl = (v: number) => `R$ ${v}`;

/** Minúscula só na primeira letra, preservando siglas como DPO, QR, BM. */
function minusculaInicial(s: string) {
  return /^[A-ZÀ-Ú]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}
