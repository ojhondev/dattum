/**
 * A venda é feita em reunião, com link de pagamento enviado por WhatsApp.
 * Todo CTA de assinatura abre conversa no WhatsApp comercial (DDI + DDD + número, só dígitos).
 * NEXT_PUBLIC_WHATSAPP sobrescreve o número padrão.
 */
const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || "5514998570045").replace(/\D/g, "");
export const WHATSAPP_EXIBICAO = "(14) 99857-0045";
export const EMAIL_CONTATO = "contato@dattis.com";

export function linkContato(mensagem: string) {
  if (WHATSAPP) return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
  return `mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent("Dattis")}&body=${encodeURIComponent(mensagem)}`;
}

export const linkAssinar = (plano?: string) =>
  linkContato(
    plano
      ? `Olá! Quero assinar o plano ${plano} da Dattis pra minha agência. Podemos marcar uma conversa?`
      : "Olá! Quero proteger minha agência com a Dattis. Podemos marcar uma conversa?",
  );

/** wa.me para um número de terceiro (lead, agência). Aceita com ou sem DDI; sem DDI assume Brasil. */
export function linkWhatsappPara(numero: string | null | undefined, mensagem = "") {
  const d = (numero ?? "").replace(/\D/g, "");
  if (d.length < 10) return null;
  const comDdi = d.length <= 11 ? `55${d}` : d;
  return `https://wa.me/${comDdi}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
}

export function formatarTelefone(numero: string | null | undefined) {
  const d = (numero ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return numero ?? "";
}
