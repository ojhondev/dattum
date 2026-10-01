// Dossiê para BM: prontidão calculada e texto de contestação que muda conforme o motivo da restrição.

export type MotivoId = "politicas" | "atividade" | "verificacao" | "dados" | "naosei";

export const MOTIVOS: { id: MotivoId; nome: string; dica: string }[] = [
  { id: "politicas", nome: "Política de publicidade", dica: "Anúncio reprovado ou conta restrita por violar regras de anúncio." },
  { id: "atividade", nome: "Atividade incomum / invasão", dica: "Logins estranhos, conta invadida ou ações em massa." },
  { id: "verificacao", nome: "Verificação do negócio", dica: "A Meta pediu para comprovar que a empresa é legítima." },
  { id: "dados", nome: "Uso de dados de clientes", dica: "Dúvida sobre listas de clientes, pixel ou API de Conversões." },
  { id: "naosei", nome: "Não sei o motivo", dica: "A restrição veio sem explicação clara." },
];

export type DadosDossie = {
  conta: { nome: string; cnpj: string | null; site: string | null };
  agenciaNome: string;
  atividades: number;
  assinadoEm: Date | null;
  ferramentas: string[];
  certificadoUrl: string | null;
  vigilancia: { nota: number; https: boolean; politica: boolean; consentimento: boolean } | null;
};

export function prontidaoDossie(d: DadosDossie) {
  const itens = [
    { label: "CNPJ cadastrado", ok: !!d.conta.cnpj },
    { label: "Site cadastrado", ok: !!d.conta.site },
    { label: "Contrato de operação assinado", ok: !!d.assinadoEm },
    { label: "Registro de tratamento preenchido", ok: d.atividades > 0 },
    { label: "Ferramentas mapeadas", ok: d.ferramentas.length > 0 },
    { label: "Certificado verificável ativo", ok: !!d.certificadoUrl },
    { label: "Site com HTTPS e política de privacidade", ok: !!d.vigilancia && d.vigilancia.https && d.vigilancia.politica },
  ];
  const pct = Math.round((itens.filter((i) => i.ok).length / itens.length) * 100);
  return { itens, pct };
}

const ABERTURA: Record<MotivoId, string> = {
  politicas:
    "Entendemos que a restrição pode estar relacionada às políticas de publicidade. Revisamos os anúncios da conta e queremos demonstrar que o anunciante é um negócio legítimo, que opera com transparência e trata os dados de seus clientes conforme a lei.",
  atividade:
    "Acreditamos que a restrição foi motivada por atividade incomum na conta. Já revisamos todos os acessos, removemos usuários que não fazem mais parte da operação e ativamos a autenticação em dois fatores para os administradores.",
  verificacao:
    "Encaminhamos as informações para comprovar a legitimidade da empresa anunciante e da agência responsável pela gestão das campanhas.",
  dados:
    "Esclarecemos como os dados de clientes são coletados e utilizados nas campanhas. Todo o tratamento é documentado e segue a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
  naosei:
    "Não recebemos detalhes sobre o motivo da restrição e, por isso, reunimos abaixo as informações que comprovam a legitimidade do negócio e a conformidade no tratamento de dados.",
};

export function textoContestacao(motivo: MotivoId, d: DadosDossie) {
  const linhas = [
    "Olá, equipe de suporte da Meta.",
    "",
    `Solicitamos a revisão da restrição aplicada à Business Manager / conta de anúncios da empresa ${d.conta.nome}${d.conta.cnpj ? ` (CNPJ ${d.conta.cnpj})` : ""}, cujas campanhas são operadas pela agência ${d.agenciaNome}.`,
    "",
    ABERTURA[motivo],
    "",
    "A empresa mantém documentados:",
    `- o registro das atividades de tratamento de dados pessoais (${d.atividades} atividade(s));`,
    d.assinadoEm
      ? `- o contrato de operação de dados entre a agência e o anunciante, assinado em ${d.assinadoEm.toLocaleDateString("pt-BR")};`
      : "- o contrato de operação de dados entre a agência e o anunciante;",
    `- a relação das ferramentas que tratam esses dados (${d.ferramentas.join(", ") || "nenhuma registrada"}).`,
  ];
  if (motivo === "dados") {
    linhas.push(
      "- listas de clientes enviadas apenas com dados de origem lícita, declarados pelo anunciante, e sempre em formato criptografado (hash);",
      "- pixel e tags de marketing condicionados ao consentimento do visitante.",
    );
  }
  if (motivo === "atividade") {
    linhas.push("- controle de acesso: somente colaboradores ativos têm acesso à Business Manager, com autenticação em dois fatores.");
  }
  if (d.conta.site) {
    const evid = d.vigilancia
      ? `O site ${d.conta.site.replace(/^https?:\/\//, "")} ${d.vigilancia.https ? "usa conexão segura (HTTPS)" : "está em processo de adequação de segurança"}${d.vigilancia.politica ? " e publica a política de privacidade" : ""}${d.vigilancia.consentimento ? ", com banner de consentimento de cookies" : ""}.`
      : `O site da empresa é ${d.conta.site.replace(/^https?:\/\//, "")}.`;
    linhas.push("", evid);
  }
  if (d.certificadoUrl) linhas.push("", `Essa documentação pode ser verificada publicamente em ${d.certificadoUrl}.`);
  linhas.push(
    "",
    "Anexamos os documentos da empresa e a documentação acima. Ficamos à disposição para qualquer informação adicional.",
    "",
    "Atenciosamente,",
    d.agenciaNome,
  );
  return linhas.join("\n");
}
