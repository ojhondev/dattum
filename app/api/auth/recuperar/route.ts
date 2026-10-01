import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { emailConfigurado, emailSimples, enviarEmail } from "@/lib/email";
import { criarLinkRedefinicao, pedidoRecente } from "@/lib/senha";
import { EMAIL_DEMO } from "@/lib/admin-dados";

export const runtime = "nodejs";

/**
 * "Esqueci minha senha". Com e-mail configurado, manda o link e responde sempre igual
 * (não revela se o e-mail tem conta). Sem e-mail, orienta a pedir o link pelo WhatsApp.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
  if (!email.includes("@")) return NextResponse.json({ ok: false, error: "Informe o e-mail da conta." }, { status: 400 });

  if (!emailConfigurado()) return NextResponse.json({ ok: true, modo: "whatsapp" });

  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.email, email) });
  if (agencia && agencia.email !== EMAIL_DEMO && !(await pedidoRecente(agencia.id))) {
    const url = await criarLinkRedefinicao(agencia.id, "email");
    const msg = emailSimples({
      titulo: "Redefinir sua senha da Dattis",
      paragrafos: [
        `Recebemos um pedido para redefinir a senha de acesso da ${agencia.nome}.`,
        "O link abaixo vale por 1 hora e só pode ser usado uma vez.",
      ],
      botao: { texto: "Criar nova senha", url },
      rodape: "Não foi você? Ignore este e-mail: sua senha atual continua valendo.",
    });
    await enviarEmail({ para: agencia.email, assunto: "Redefinir sua senha da Dattis", ...msg });
  }
  return NextResponse.json({ ok: true, modo: "email" });
}
