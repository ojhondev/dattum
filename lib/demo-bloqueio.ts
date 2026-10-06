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
