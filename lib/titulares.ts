import { randomBytes } from "node:crypto";

// Pedidos de titulares (art. 18 da LGPD), em linguagem de quem pede.
export const TIPOS_PEDIDO: { id: string; rotulo: string; descricao: string }[] = [
  { id: "acesso", rotulo: "Saber quais dados vocês têm sobre mim", descricao: "Confirmação e acesso aos dados (art. 18, I e II)" },
  { id: "correcao", rotulo: "Corrigir meus dados", descricao: "Correção de dados incompletos, inexatos ou desatualizados (art. 18, III)" },
  { id: "exclusao", rotulo: "Apagar meus dados", descricao: "Eliminação, anonimização ou bloqueio (art. 18, IV e VI)" },
  { id: "marketing", rotulo: "Parar de receber anúncios e mensagens", descricao: "Oposição e revogação do consentimento (art. 18, IX, e art. 8º, §5º)" },
  { id: "portabilidade", rotulo: "Receber uma cópia dos meus dados", descricao: "Portabilidade (art. 18, V)" },
  { id: "compartilhamento", rotulo: "Saber com quem meus dados foram compartilhados", descricao: "Informação sobre compartilhamento (art. 18, VII)" },
  { id: "outro", rotulo: "Outro pedido ou dúvida", descricao: "Outros direitos e dúvidas sobre privacidade" },
];

export const rotuloTipo = (id: string) => TIPOS_PEDIDO.find((t) => t.id === id)?.rotulo ?? id;

export const STATUS_PEDIDO: Record<string, { rotulo: string; classe: string }> = {
  aberto: { rotulo: "Novo", classe: "pendente" },
  em_andamento: { rotulo: "Em andamento", classe: "pendente" },
  respondido: { rotulo: "Respondido", classe: "ok" },
  recusado: { rotulo: "Encerrado sem atender", classe: "pendente" },
};

export const PRAZO_DIAS = 15;

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function novoProtocolo() {
  const b = randomBytes(6);
  const s = Array.from(b, (x) => ALFABETO[x % ALFABETO.length]).join("");
  return `LGPD-${new Date().getFullYear()}-${s}`;
}

/** Dias até o prazo (negativo = atrasado). */
export const diasAtePrazo = (prazo: Date, agora = Date.now()) => Math.ceil((prazo.getTime() - agora) / 86_400_000);
