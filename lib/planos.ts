export type PlanoId = "start" | "growth" | "scale";

export type Plano = {
  id: PlanoId;
  nome: string;
  preco: number; // R$ por cliente da agência/mês
  resumo: string;
  destaque?: boolean;
};

export const PLANOS: Plano[] = [
  { id: "start", nome: "Start", preco: 47, resumo: "Pra organizar o básico da documentação." },
  { id: "growth", nome: "Growth", preco: 97, resumo: "O essencial pra operar protegido e provar isso.", destaque: true },
  { id: "scale", nome: "Scale", preco: 297, resumo: "Com DPO: a Dattis assume o papel de encarregado da agência." },
];

/** Recursos por pilar. `true` = incluso, `false` = não incluso, string = incluso com detalhe. */
export type Recurso = { pilar: string; nome: string; valores: Record<PlanoId, boolean | string> };

export const RECURSOS: Recurso[] = [
  { pilar: "Documentação", nome: "RAT por conta de cliente", valores: { start: true, growth: true, scale: true } },
  { pilar: "Documentação", nome: "Contrato de operação (DPA)", valores: { start: "Modelo pronto", growth: "Com assinatura eletrônica", scale: "Com assinatura eletrônica" } },
  { pilar: "Documentação", nome: "Registro de subprocessadores", valores: { start: true, growth: true, scale: true } },
  { pilar: "Proteção", nome: "Certificado e selo com QR Code", valores: { start: false, growth: "Agência e clientes", scale: "Agência e clientes" } },
  { pilar: "Proteção", nome: "Dossiê para BM suspensa", valores: { start: false, growth: true, scale: true } },
  { pilar: "Proteção", nome: "Auditoria de sites e páginas", valores: { start: false, growth: "Mensal", scale: "Semanal, com alertas" } },
  { pilar: "Relacionamento", nome: "DAT: resumo de conformidade pro cliente", valores: { start: false, growth: true, scale: true } },
  { pilar: "Relacionamento", nome: "Diagnóstico Expresso", valores: { start: true, growth: true, scale: true } },
  { pilar: "Governança", nome: "DPO (encarregado de dados) da agência", valores: { start: false, growth: false, scale: true } },
  { pilar: "Governança", nome: "Atendimento ao titular dos dados", valores: { start: false, growth: false, scale: "Feito pelo DPO" } },
  { pilar: "Governança", nome: "Suporte", valores: { start: "E-mail", growth: "Prioritário", scale: "Gestor dedicado" } },
];

export function destaquesDoPlano(id: PlanoId): string[] {
  return RECURSOS.filter((r) => r.valores[id] !== false).map((r) =>
    typeof r.valores[id] === "string" ? `${r.nome}: ${(r.valores[id] as string).toLowerCase()}` : r.nome,
  );
}

export const brl = (v: number) => `R$ ${v}`;
