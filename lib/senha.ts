import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, redefinicoesSenha } from "@/lib/db/schema";
import { hashSenha } from "@/lib/auth";
import { urlAbsoluta } from "@/lib/site";

const HORA = 3_600_000;
// Por e-mail o link vale 1 hora; o gerado no admin e mandado por WhatsApp vale 3 dias.
const VALIDADE = { email: 1 * HORA, admin: 72 * HORA } as const;

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

/** Cria um link de uso único. Só o hash do token fica no banco. */
export async function criarLinkRedefinicao(agenciaId: string, origem: keyof typeof VALIDADE) {
  const token = randomBytes(32).toString("base64url");
  await db.insert(redefinicoesSenha).values({
    agenciaId,
    tokenHash: hashToken(token),
    origem,
    expiraEm: new Date(Date.now() + VALIDADE[origem]),
  });
  return urlAbsoluta(`/redefinir-senha/${token}`);
}

/** Pedido recente (últimos 2 minutos) — evita disparar vários e-mails seguidos. */
export async function pedidoRecente(agenciaId: string) {
  const r = await db.query.redefinicoesSenha.findFirst({
    where: and(eq(redefinicoesSenha.agenciaId, agenciaId), gt(redefinicoesSenha.criadoEm, new Date(Date.now() - 2 * 60_000))),
  });
  return !!r;
}

export async function validarTokenRedefinicao(token: string) {
  if (!token || token.length < 30) return null;
  const r = await db.query.redefinicoesSenha.findFirst({
    where: and(eq(redefinicoesSenha.tokenHash, hashToken(token)), isNull(redefinicoesSenha.usadoEm), gt(redefinicoesSenha.expiraEm, new Date())),
  });
  if (!r) return null;
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, r.agenciaId) });
  return agencia ? { pedido: r, agencia } : null;
}

/** Troca a senha e invalida todos os links pendentes dessa agência. */
export async function redefinirSenha(token: string, novaSenha: string) {
  const v = await validarTokenRedefinicao(token);
  if (!v) return null;
  const agora = new Date();
  await db.update(agencias).set({ senhaHash: await hashSenha(novaSenha), senhaDefinida: true }).where(eq(agencias.id, v.agencia.id));
  await db
    .update(redefinicoesSenha)
    .set({ usadoEm: agora })
    .where(and(eq(redefinicoesSenha.agenciaId, v.agencia.id), isNull(redefinicoesSenha.usadoEm)));
  return v.agencia;
}
