// Envio de e-mail transacional pela API do Resend (sem SDK). Fica desligado até existir RESEND_API_KEY,
// o que depende do domínio próprio verificado. Sem chave, quem chama cai no plano B (WhatsApp).

const REMETENTE = process.env.EMAIL_REMETENTE || "Dattis <nao-responda@dattis.com.br>";

export const emailConfigurado = () => !!process.env.RESEND_API_KEY;

export async function enviarEmail(msg: { para: string; assunto: string; html: string; texto: string }) {
  if (!emailConfigurado()) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: REMETENTE, to: [msg.para], subject: msg.assunto, html: msg.html, text: msg.texto }),
    });
    if (!r.ok) console.error("[email]", r.status, await r.text().catch(() => ""));
    return r.ok;
  } catch (err) {
    console.error("[email]", err);
    return false;
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Layout simples e legível em qualquer cliente de e-mail. */
export function emailSimples(p: { titulo: string; paragrafos: string[]; botao?: { texto: string; url: string }; rodape?: string }) {
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f4f2;font-family:Arial,Helvetica,sans-serif;color:#141f1b">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <p style="font-size:20px;font-weight:bold;color:#002820;margin:0 0 24px">Dattis</p>
    <div style="background:#ffffff;border-radius:16px;padding:28px 24px">
      <h1 style="font-size:20px;line-height:1.3;margin:0 0 16px">${esc(p.titulo)}</h1>
      ${p.paragrafos.map((t) => `<p style="font-size:15px;line-height:1.6;margin:0 0 14px">${esc(t)}</p>`).join("")}
      ${p.botao ? `<p style="margin:24px 0 8px"><a href="${esc(p.botao.url)}" style="display:inline-block;background:#002820;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">${esc(p.botao.texto)}</a></p>` : ""}
    </div>
    ${p.rodape ? `<p style="font-size:12px;line-height:1.5;color:#59645f;margin:18px 4px 0">${esc(p.rodape)}</p>` : ""}
  </div></body></html>`;
  const texto = [p.titulo, "", ...p.paragrafos, ...(p.botao ? ["", `${p.botao.texto}: ${p.botao.url}`] : []), ...(p.rodape ? ["", p.rodape] : [])].join("\n");
  return { html, texto };
}
