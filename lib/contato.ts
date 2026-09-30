/**
 * A venda é feita em reunião, com link de pagamento enviado por WhatsApp.
 * Todo CTA de assinatura abre conversa no WhatsApp (NEXT_PUBLIC_WHATSAPP, só dígitos com DDI,
 * ex.: 5511999999999). Sem o número configurado, cai no e-mail.
 */
const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");
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
