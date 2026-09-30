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
