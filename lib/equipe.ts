import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias, usuarios } from "@/lib/db/schema";
import { hashSenha } from "@/lib/auth";
import { urlAbsoluta } from "@/lib/site";

const DIAS_CONVITE = 7;
const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

/** E-mail já usado como login (de agência ou de pessoa de equipe)? Logins são únicos na Dattis. */
export async function emailEmUso(email: string) {
  const [a, u] = await Promise.all([
    db.query.agencias.findFirst({ where: eq(agencias.email, email), columns: { id: true } }),
    db.query.usuarios.findFirst({ where: eq(usuarios.email, email), columns: { id: true } }),
  ]);
  return !!(a || u);
}

/** Gera (ou renova) o link de convite. Só o hash fica no banco; o link vale 7 dias. */
export async function novoConvite(usuarioId: string) {
  const token = randomBytes(32).toString("base64url");
  await db
    .update(usuarios)
    .set({ conviteHash: hashToken(token), conviteExpira: new Date(Date.now() + DIAS_CONVITE * 86_400_000) })
    .where(eq(usuarios.id, usuarioId));
  return urlAbsoluta(`/convite/${token}`);
}

export async function conviteValido(token: string) {
  if (!token || token.length < 30) return null;
  const u = await db.query.usuarios.findFirst({
    where: and(eq(usuarios.conviteHash, hashToken(token)), gt(usuarios.conviteExpira, new Date()), eq(usuarios.ativo, true)),
  });
  if (!u) return null;
  const agencia = await db.query.agencias.findFirst({ where: eq(agencias.id, u.agenciaId), columns: { nome: true } });
  return { usuario: u, agenciaNome: agencia?.nome ?? "" };
}

export async function aceitarConvite(token: string, senha: string, nome?: string) {
  const v = await conviteValido(token);
  if (!v) return null;
  const [u] = await db
    .update(usuarios)
    .set({ senhaHash: await hashSenha(senha), nome: nome?.trim() || v.usuario.nome, conviteHash: null, conviteExpira: null, ultimoAcesso: new Date() })
    .where(eq(usuarios.id, v.usuario.id))
    .returning();
  return u;
}

export async function equipeDaAgencia(agenciaId: string) {
  return db.query.usuarios.findMany({ where: eq(usuarios.agenciaId, agenciaId), orderBy: (t, { asc }) => asc(t.criadoEm) });
}
