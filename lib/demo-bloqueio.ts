import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { EMAIL_DEMO } from "@/lib/admin-dados";

const MENSAGEM =
  "Esta é a conta de demonstração, compartilhada com outros visitantes: aqui dá para ver tudo, mas não alterar. Para testar com os seus clientes, fale com a gente.";

/**
 * A conta demo é uma só para todos os visitantes. Toda rota que altera dados chama isto logo depois
 * do login: na demo, devolve a resposta 403 pronta; nas outras agências, null (segue normal).
 */
export async function bloqueioDemo(agenciaId: string) {
  const a = await db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId), columns: { email: true } });
  return a?.email === EMAIL_DEMO ? NextResponse.json({ ok: false, error: MENSAGEM }, { status: 403 }) : null;
}

const MENSAGEM_EXPLORACAO =
  "Sua conta está em exploração: dá para cadastrar a agência e os clientes, mas documentos, contratos, selo, certificado e publicações são liberados quando o plano for ativado. Fale com a Dattis no WhatsApp ou aplique seu código de ativação no painel.";

/**
 * Conta criada pelo site e ainda não ativada pela Dattis: toda rota que EMITE algo para fora da plataforma
 * (PDF, link de assinatura, certificado, política ou aviso de cookies publicados) chama isto. 403 pronto ou null.
 */
export async function bloqueioExploracao(agenciaId: string) {
  const a = await db.query.agencias.findFirst({ where: eq(agencias.id, agenciaId), columns: { ativadaEm: true } });
  return a && !a.ativadaEm ? NextResponse.json({ ok: false, error: MENSAGEM_EXPLORACAO }, { status: 403 }) : null;
}
